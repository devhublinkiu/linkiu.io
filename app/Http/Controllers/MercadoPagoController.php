<?php

namespace App\Http\Controllers;

use App\Actions\Orders\CrearOrden;
use App\Jobs\NotificarOrdenCreada;
use App\Models\Order;
use App\Services\EnvioService;
use App\Services\MercadoPagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MercadoPagoController extends Controller
{
    public function __construct(
        private MercadoPagoService $mp,
        private CrearOrden $crearOrden,
        private EnvioService $envioService,
    ) {}

    // -------------------------------------------------------------------------
    // POST /api/mp/pagar
    // -------------------------------------------------------------------------
    public function pagar(Request $request): JsonResponse
    {
        $data = $request->validate([
            'form_data'                              => 'required|array',
            'form_data.transaction_amount'           => 'required|numeric|min:1',
            'form_data.payment_method_id'            => 'required|string',
            'form_data.token'                        => 'nullable|string',
            'form_data.installments'                 => 'nullable|integer|min:1',
            'form_data.issuer_id'                    => 'nullable|string',
            'form_data.payer'                        => 'required|array',
            'form_data.payer.email'                  => 'required|email',
            'form_data.transaction_details'          => 'nullable|array',
            'order'                                  => 'required|array',
            'order.nombre'                           => 'required|string',
            'order.apellido'                         => 'required|string',
            'order.email'                            => 'required|email',
            'order.telefono'                         => 'required|string',
            'order.departamento'                     => 'required|string',
            'order.ciudad'                           => 'required|string',
            'order.direccion'                        => 'required|string',
            'order.apartamento'                      => 'nullable|string',
            'order.notas'                            => 'nullable|string',
            'order.subtotal'                         => 'required|integer|min:0',
            'order.costo_envio'                      => 'required|integer|min:0',
            'order.recargo'                          => 'required|integer|min:0',
            'order.total'                            => 'required|integer|min:1',
            'order.items'                            => 'required|array|min:1',
            'order.items.*.nombre'                   => 'required|string',
            'order.items.*.imagen'                   => 'nullable|string',
            'order.items.*.label'                    => 'nullable|string',
            'order.items.*.cantidad'                 => 'required|integer|min:1',
            'order.items.*.precio'                   => 'required|integer|min:0',
            // producto_id es nullable porque el frontend solo lo envía si el
            // item viene del catálogo. Items sin producto_id quedan fuera del
            // snapshot de performance (Score/Temperatura). Si en producción
            // aparecen muchos items sin producto_id, hay que investigar de
            // dónde se generan e idealmente forzar required.
            'order.items.*.producto_id'              => 'nullable|integer|exists:productos,id',
        ]);

        if (! $this->mp->tieneCredenciales()) {
            Log::warning('MP pagar intentado sin credenciales configuradas', ['email' => $data['order']['email']]);
            return response()->json([
                'error' => 'La pasarela de pago no está disponible en este momento. Por favor, contacta al soporte de la tienda.',
            ], 422);
        }

        // Defensa anti-tampering: recalcular total con EnvioService y validar
        // que el monto que MP está por cobrar (transaction_amount) coincide con
        // el cálculo autoritativo del backend. Si difieren, abortamos ANTES de
        // cobrar — sin esto, un cliente podría manipular costo_envio=0 desde
        // la consola y pagar menos del precio real.
        $costoEnvioReal = $this->envioService->calcularCostoEnvio(
            ciudad:   $data['order']['ciudad'],
            subtotal: (int) $data['order']['subtotal'],
        );

        if ($costoEnvioReal === null) {
            return response()->json([
                'error' => 'La ciudad seleccionada no tiene cobertura de envío.',
            ], 422);
        }

        $totalReal = (int) $data['order']['subtotal'] + $costoEnvioReal + (int) $data['order']['recargo'];

        if ((int) $data['form_data']['transaction_amount'] !== $totalReal) {
            Log::warning('MP pagar: total cliente difiere del recalculado', [
                'email'         => $data['order']['email'],
                'total_cliente' => $data['form_data']['transaction_amount'],
                'total_real'    => $totalReal,
            ]);
            return response()->json([
                'error' => 'El total del pedido cambió. Recarga la página y vuelve a intentar.',
            ], 422);
        }

        // Sobrescribimos los valores del cliente con los autoritativos para
        // que CrearOrden los persista correctamente (defensa redundante).
        $data['order']['costo_envio'] = $costoEnvioReal;
        $data['order']['total']       = $totalReal;

        // Idempotency-Key estable: misma combinación email+total+items dentro
        // de la misma ventana de 1 minuto produce el mismo key. Si el cliente
        // re-clickea Pagar (red lenta), MP detecta el duplicado y devuelve el
        // mismo payment_id en lugar de cobrar 2 veces.
        $idempotencyKey = hash('sha256', json_encode([
            'email'  => $data['order']['email'],
            'total'  => $data['order']['total'],
            'items'  => array_map(
                fn ($i) => ($i['producto_id'] ?? 'x') . ':' . $i['cantidad'],
                $data['order']['items'],
            ),
            'minute' => now()->format('Y-m-d-H-i'),
        ]));

        try {
            $resultado = $this->mp->crearPago(
                formData:        $data['form_data'],
                descripcion:     'Pedido Linkiu',
                notificationUrl: route('mp.webhook'),
                idempotencyKey:  $idempotencyKey,
            );
        } catch (\MercadoPago\Exceptions\MPApiException $e) {
            Log::error('MP pagar API error', [
                'status'   => $e->getStatusCode(),
                'response' => $e->getApiResponse()->getContent(),
            ]);
            return response()->json(['error' => 'No se pudo procesar el pago. Intenta nuevamente.'], 422);
        } catch (\Throwable $e) {
            Log::error('MP pagar error: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudo procesar el pago. Intenta nuevamente.'], 422);
        }

        $status = $resultado['status'];

        // Pago rechazado — no crear orden
        if ($status === 'rejected' || $status === 'cancelled') {
            $mensaje = $this->mensajeRechazo($resultado['status_detail']);
            return response()->json(['error' => $mensaje], 422);
        }

        // Delegamos a CrearOrden: maneja cliente + orden + items + dirección.
        // Si MP ya aprobó, la orden se crea como 'confirmado' y se notifica
        // de una; si está pending, queda 'pendiente' y NO notifica al cliente
        // — el webhook se encargará cuando MP confirme.
        $aprobado = $status === 'approved';

        $orden = $this->crearOrden->execute(
            data: [...$data['order'], 'metodo_pago' => 'mercadopago'],
            extra: [
                'mp_payment_id'    => (string) $resultado['id'],
                'mp_status'        => $resultado['status'],
                'mp_status_detail' => $resultado['status_detail'],
                'mp_notificado_at' => $aprobado ? now() : null,
            ],
            estadoInicial: $aprobado ? 'confirmado' : 'pendiente',
            notificar:     $aprobado,
        );

        // Pending: notificar SOLO al admin vía Ably. NO dispatcheamos
        // NotificarOrdenCreada porque ese job también notifica al cliente
        // (mail + WhatsApp), y queremos esperar a que MP confirme antes de
        // decirle al cliente "tu pedido fue recibido". El webhook approved
        // se encargará de eso.
        //
        // Mantenido inline (vs un Job) porque es una sola operación liviana
        // con manejo de error explícito y sin background processing necesario.
        if (! $aprobado) {
            try {
                $ably = new \Ably\AblyRest(config('broadcasting.connections.ably.key'));
                $ably->channels->get('admin-orders')->publish('orden.nueva', [
                    'id'         => $orden->id,
                    'codigo'     => $orden->codigo,
                    'nombre'     => $orden->nombre . ' ' . $orden->apellido,
                    'total'      => $orden->total,
                    'created_at' => $orden->created_at->format('H:i'),
                ]);
            } catch (\Exception $e) {
                Log::error('Ably publish MP NuevoOrden (pending): ' . $e->getMessage());
            }
        }

        return response()->json([
            'status'                => $status,
            'status_detail'         => $resultado['status_detail'],
            'codigo'                => $orden->codigo,
            'acceso_token'          => $orden->acceso_token,
            'nombre'                => $orden->nombre,
            'email'                 => $orden->email,
            'total'                 => $orden->total,
            'external_resource_url' => $resultado['external_resource_url'],
            'three_ds_info'         => $resultado['three_ds_info'],
            'payment_id'            => $resultado['id'],
        ]);
    }

    // -------------------------------------------------------------------------
    // POST /webhooks/mercadopago
    // -------------------------------------------------------------------------
    public function webhook(Request $request): JsonResponse
    {
        $xSignature = $request->header('x-signature', '');
        $xRequestId = $request->header('x-request-id', '');
        $dataId     = $request->query('data_id') ?? ($request->input('data.id', ''));

        // Fail-closed: si NO hay firma, NO hay secret, o la firma no valida,
        // rechazamos. `verificarWebhook` retorna false en cualquiera de esos
        // casos. Esto evita que un atacante manipule el estado de órdenes
        // ajenas conociendo solo el mp_payment_id.
        if (! $this->mp->verificarWebhook($xSignature, $xRequestId, $dataId)) {
            Log::warning('MP webhook firma inválida o ausente', [
                'ip'        => $request->ip(),
                'tiene_sig' => (bool) $xSignature,
                'data_id'   => $dataId,
            ]);
            return response()->json(['ok' => false], 401);
        }

        if ($request->input('type') !== 'payment') {
            return response()->json(['ok' => true]);
        }

        $paymentId = $request->input('data.id');
        if (! $paymentId) return response()->json(['ok' => true]);

        try {
            $pago = $this->mp->consultarPago($paymentId);
        } catch (\Throwable $e) {
            Log::error('MP webhook consulta error: ' . $e->getMessage());
            return response()->json(['ok' => false], 500);
        }

        $orden = Order::where('mp_payment_id', (string) $paymentId)->first();
        if (! $orden) return response()->json(['ok' => true]);

        $orden->mp_status        = $pago['status'];
        $orden->mp_status_detail = $pago['status_detail'];

        // Idempotencia: MP reenvía webhooks múltiples veces. Solo
        // dispatch NotificarOrdenCreada una vez por orden — la columna
        // mp_notificado_at deja constancia explícita.
        if ($pago['status'] === 'approved' && $orden->mp_notificado_at === null) {
            $orden->estado            = 'confirmado';
            $orden->mp_notificado_at  = now();
            $orden->save();
            NotificarOrdenCreada::dispatch($orden);
            return response()->json(['ok' => true]);
        }

        if (in_array($pago['status'], ['rejected', 'cancelled'])) {
            $orden->estado = 'cancelado';
        }

        $orden->save();

        return response()->json(['ok' => true]);
    }

    // -------------------------------------------------------------------------
    // GET /mp/resultado  (callback PSE / 3DS)
    // -------------------------------------------------------------------------
    public function callback(Request $request)
    {
        $paymentId = $request->query('payment_id') ?? $request->query('collection_id');

        return Inertia::render('public/MpResultado', [
            'payment_id' => $paymentId,
        ]);
    }

    // -------------------------------------------------------------------------

    private function mensajeRechazo(?string $detail): string
    {
        return match ($detail) {
            'cc_rejected_insufficient_amount' => 'Fondos insuficientes. Intenta con otra tarjeta.',
            'cc_rejected_bad_filled_security_code' => 'CVV incorrecto. Verifica el código de seguridad.',
            'cc_rejected_bad_filled_date' => 'Fecha de vencimiento incorrecta.',
            'cc_rejected_bad_filled_card_number' => 'Número de tarjeta inválido.',
            'cc_rejected_card_disabled' => 'Tarjeta bloqueada. Contacta a tu banco.',
            'cc_rejected_duplicated_payment' => 'Pago duplicado. Ya existe un cobro por este monto.',
            'cc_rejected_blacklist' => 'Tarjeta no autorizada.',
            'rejected_high_risk' => 'Pago rechazado por seguridad. Intenta con otro método.',
            default => 'Pago rechazado. Intenta con otra tarjeta o elige un método diferente.',
        };
    }
}
