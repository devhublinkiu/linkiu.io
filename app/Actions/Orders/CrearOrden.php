<?php

namespace App\Actions\Orders;

use App\Jobs\NotificarOrdenCreada;
use App\Models\Client;
use App\Models\Order;
use App\Services\AntifraudeService;
use App\Services\EnvioService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Orquesta la creación de una orden completa:
 *
 *  1. Crea/actualiza el cliente (snapshot de nombre y teléfono).
 *  2. Sube el comprobante a S3 si viene en el request.
 *  3. Crea la orden + sus items dentro de una transacción atómica.
 *  4. Guarda la dirección al perfil del cliente si está autenticado.
 *  5. Dispara el job NotificarOrdenCreada — los canales (Ably/Mail/WhatsApp)
 *     corren en background, el cliente recibe el response inmediato.
 *
 * Soporta el caso MercadoPago vía `extra` (mp_payment_id, mp_status, etc.),
 * `estadoInicial` (approved → 'confirmado') y `notificar` (false cuando el
 * pago está pendiente y solo el webhook debe disparar la notificación).
 */
class CrearOrden
{
    public function __construct(
        private readonly EnvioService $envioService,
        private readonly AntifraudeService $antifraude,
    ) {}

    /**
     * @param  array        $data         Payload de la orden (nombre, email, items, etc.)
     * @param  UploadedFile $comprobante  Comprobante de transferencia, si aplica.
     * @param  array        $extra        Campos extra para Order::create (mp_payment_id,
     *                                    mp_status, mp_status_detail, mp_notificado_at, etc.)
     * @param  string       $estadoInicial Estado de la orden al crear. 'pendiente' por defecto;
     *                                     MercadoPago approved la crea ya en 'confirmado'.
     * @param  bool         $notificar    Si false, NO dispatcha NotificarOrdenCreada. Útil
     *                                    cuando MP está pending y solo el webhook debe notificar.
     *
     * @throws \InvalidArgumentException si la ciudad no tiene cobertura de envío.
     */
    public function execute(
        array $data,
        ?UploadedFile $comprobante = null,
        array $extra = [],
        string $estadoInicial = 'pendiente',
        bool $notificar = true,
    ): Order {
        // Recálculo autoritativo del costo de envío y del total. Ignoramos lo
        // que viene del cliente — previene tampering (cliente no puede mandar
        // `costo_envio=0` para evadir el cobro real). Ver EnvioService.
        $data = $this->recalcularEnvioYTotal($data);

        $orden = DB::transaction(function () use ($data, $comprobante, $extra, $estadoInicial) {
            $cliente = $this->resolverCliente($data);

            $rutaComprobante = $comprobante
                ? $comprobante->store('ordenes/comprobantes', 's3')
                : null;

            // El código LNK-XXXXXX y el acceso_token los pone el observer del modelo.
            $orden = Order::create([
                'client_id'        => $cliente->id,
                'estado'           => $estadoInicial,
                'metodo_pago'      => $data['metodo_pago'],
                'subtotal'         => $data['subtotal'],
                'costo_envio'      => $data['costo_envio'],
                'recargo'          => $data['recargo'],
                'total'            => $data['total'],
                'nombre'           => $data['nombre'],
                'apellido'         => $data['apellido'],
                'email'            => $data['email'],
                'telefono'         => $data['telefono'],
                'departamento'     => $data['departamento'],
                'ciudad'           => $data['ciudad'],
                'direccion'        => $data['direccion'],
                'apartamento'      => $data['apartamento'] ?? null,
                'notas'            => $data['notas'] ?? null,
                'comprobante_path' => $rutaComprobante,
                ...$extra,
            ]);

            foreach ($data['items'] as $item) {
                $orden->items()->create([
                    'producto_id'     => $item['producto_id'] ?? null,
                    'producto_nombre' => $item['nombre'],
                    'producto_imagen' => $item['imagen'] ?? null,
                    'label'           => $item['label'] ?? null,
                    'cantidad'        => $item['cantidad'],
                    'precio_unitario' => $item['precio'],
                ]);
            }

            return $orden->fresh();
        });

        $this->guardarDireccionCliente($orden);

        // Antifraude — Capa 2. Si la orden dispara reglas activas, queda
        // bloqueada con revision_estado='pendiente' hasta que el admin la
        // apruebe. Las notificaciones (cliente y merchant) se mantienen para
        // que el merchant sepa que tiene algo nuevo para revisar en el admin.
        $motivos = $this->antifraude->evaluar($orden);
        if (! empty($motivos)) {
            $orden->update([
                'revision_estado'  => 'pendiente',
                'revision_motivos' => $motivos,
            ]);
            $orden->refresh();
        }

        // Background: Ably + Mail + SendPulse. El cliente no espera.
        if ($notificar) {
            NotificarOrdenCreada::dispatch($orden);
        }

        return $orden;
    }

    /**
     * Recalcula `costo_envio` y `total` con EnvioService. Sobrescribe lo que
     * vino del cliente (que pudo ser manipulado). Si la ciudad no tiene
     * cobertura, lanza excepción — el frontend valida antes de mostrar pagar,
     * pero defensa profunda por si llega un payload directo a la API.
     */
    private function recalcularEnvioYTotal(array $data): array
    {
        $costoEnvio = $this->envioService->calcularCostoEnvio(
            ciudad:   $data['ciudad'],
            subtotal: (int) $data['subtotal'],
        );

        if ($costoEnvio === null) {
            throw new \InvalidArgumentException(
                'La ciudad seleccionada no tiene cobertura de envío.',
            );
        }

        $data['costo_envio'] = $costoEnvio;
        $data['total']       = (int) $data['subtotal'] + $costoEnvio + (int) ($data['recargo'] ?? 0);

        return $data;
    }

    private function resolverCliente(array $data): Client
    {
        $clienteData = [
            'nombre'   => $data['nombre'],
            'apellido' => $data['apellido'],
            'telefono' => $data['telefono'],
        ];

        if (! empty($data['crear_cuenta']) && ! empty($data['contrasena'])) {
            $clienteData['password'] = $data['contrasena'];
        }

        return Client::updateOrCreate(['email' => $data['email']], $clienteData);
    }

    /**
     * Si el comprador estaba autenticado, guarda la dirección del pedido a su
     * perfil para reusarla en futuras compras. Falla silenciosa.
     */
    private function guardarDireccionCliente(Order $orden): void
    {
        if (! Auth::guard('client')->check()) {
            return;
        }

        if (Auth::guard('client')->user()->email !== $orden->email) {
            return;
        }

        try {
            $clienteAuth = Auth::guard('client')->user();
            $existe = $clienteAuth->addresses()
                ->where('ciudad',    $orden->ciudad)
                ->where('direccion', $orden->direccion)
                ->exists();

            if (! $existe) {
                $esPrimera = $clienteAuth->addresses()->count() === 0;
                $clienteAuth->addresses()->create([
                    'nombre'         => $orden->nombre . ' ' . $orden->apellido,
                    'telefono'       => $orden->telefono,
                    'departamento'   => $orden->departamento,
                    'ciudad'         => $orden->ciudad,
                    'direccion'      => $orden->direccion,
                    'apartamento'    => $orden->apartamento,
                    'predeterminada' => $esPrimera,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('CrearOrden::guardarDireccionCliente: ' . $e->getMessage());
        }
    }
}
