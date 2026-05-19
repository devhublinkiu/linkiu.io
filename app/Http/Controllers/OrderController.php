<?php

namespace App\Http\Controllers;

use App\Mail\OrdenConfirmadaMail;
use App\Models\Client;
use App\Models\Order;
use App\Services\SendPulseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function store(Request $request, SendPulseService $sendPulse)
    {
        $data = $request->validate([
            'nombre'              => 'required|string|max:100',
            'apellido'            => 'required|string|max:100',
            'email'               => 'required|email|max:200',
            'telefono'            => 'required|string|max:30',
            'departamento'        => 'required|string|max:100',
            'ciudad'              => 'required|string|max:100',
            'direccion'           => 'required|string|max:300',
            'apartamento'         => 'nullable|string|max:100',
            'notas'               => 'nullable|string|max:500',
            'metodo_pago'         => 'required|string|max:50',
            'subtotal'            => 'required|integer|min:0',
            'costo_envio'         => 'required|integer|min:0',
            'recargo'             => 'required|integer|min:0',
            'total'               => 'required|integer|min:1',
            'crear_cuenta'        => 'boolean',
            'contrasena'          => 'nullable|string|min:8|required_if:crear_cuenta,true',
            'comprobante'         => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'items'               => 'required|array|min:1',
            'items.*.producto_id' => 'nullable|integer|exists:productos,id',
            'items.*.nombre'      => 'required|string|max:200',
            'items.*.imagen'      => 'nullable|string|max:500',
            'items.*.label'       => 'nullable|string|max:100',
            'items.*.cantidad'    => 'required|integer|min:1',
            'items.*.precio'      => 'required|integer|min:0',
        ]);

        $orden = DB::transaction(function () use ($data, $request) {
            // Crear o actualizar cliente
            $clienteData = [
                'nombre'   => $data['nombre'],
                'apellido' => $data['apellido'],
                'telefono' => $data['telefono'],
            ];

            if (! empty($data['crear_cuenta']) && ! empty($data['contrasena'])) {
                $clienteData['password'] = $data['contrasena'];
            }

            $cliente = Client::updateOrCreate(
                ['email' => $data['email']],
                $clienteData
            );

            // Subir comprobante
            $comprobantePath = null;
            if ($request->hasFile('comprobante')) {
                $comprobantePath = $request->file('comprobante')
                    ->store('ordenes/comprobantes', 'public');
            }

            // Generar código único
            $codigo = $this->generarCodigo();

            // Crear orden
            $orden = Order::create([
                'codigo'       => $codigo,
                'client_id'    => $cliente->id,
                'estado'       => 'pendiente',
                'metodo_pago'  => $data['metodo_pago'],
                'subtotal'     => $data['subtotal'],
                'costo_envio'  => $data['costo_envio'],
                'recargo'      => $data['recargo'],
                'total'        => $data['total'],
                'nombre'       => $data['nombre'],
                'apellido'     => $data['apellido'],
                'email'        => $data['email'],
                'telefono'     => $data['telefono'],
                'departamento' => $data['departamento'],
                'ciudad'       => $data['ciudad'],
                'direccion'    => $data['direccion'],
                'apartamento'  => $data['apartamento'] ?? null,
                'notas'        => $data['notas'] ?? null,
                'comprobante_path' => $comprobantePath,
            ]);

            // Crear items
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

            return $orden;
        });

        // Guardar dirección solo si el cliente autenticado es quien hizo la compra
        if (auth('client')->check() && auth('client')->user()->email === $orden->email) {
            try {
                $clienteAuth = auth('client')->user();
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
                \Log::error('Guardar dirección checkout: ' . $e->getMessage());
            }
        }

        // Broadcast en tiempo real para el admin
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
            \Log::error('Ably publish NuevoOrden: ' . $e->getMessage());
        }

        // Notificaciones (fuera de la transacción para no bloquear)
        try {
            Mail::to($orden->email)->send(new OrdenConfirmadaMail($orden));
        } catch (\Exception $e) {
            \Log::error('OrdenConfirmadaMail: ' . $e->getMessage());
        }

        try {
            $sendPulse->notificarOrdenCreada($orden);
        } catch (\Exception $e) {
            \Log::error('SendPulse notificarOrdenCreada: ' . $e->getMessage());
        }

        return Inertia::render('public/OrdenConfirmacion', [
            'codigo' => $orden->codigo,
            'nombre' => $orden->nombre,
            'email'  => $orden->email,
            'total'  => $orden->total,
        ]);
    }

    public function confirmacion(string $codigo)
    {
        $orden = Order::where('codigo', $codigo)->firstOrFail();

        return Inertia::render('public/OrdenConfirmacion', [
            'codigo' => $orden->codigo,
            'nombre' => $orden->nombre,
            'email'  => $orden->email,
            'total'  => $orden->total,
        ]);
    }

    public function seguimiento(string $codigo)
    {
        $orden = Order::with('items')
            ->where('codigo', $codigo)
            ->firstOrFail();

        return Inertia::render('public/OrdenSeguimiento', [
            'orden' => [
                'codigo'         => $orden->codigo,
                'estado'         => $orden->estado,
                'nombre'         => $orden->nombre,
                'ciudad'         => $orden->ciudad,
                'departamento'   => $orden->departamento,
                'metodo_pago'    => $orden->metodo_pago,
                'subtotal'       => $orden->subtotal,
                'costo_envio'    => $orden->costo_envio,
                'recargo'        => $orden->recargo,
                'total'          => $orden->total,
                'numero_guia'    => $orden->numero_guia,
                'transportadora' => $orden->transportadora,
                'created_at'     => $orden->created_at->format('d/m/Y H:i'),
                'items'       => $orden->items->map(fn ($i) => [
                    'nombre'   => $i->producto_nombre,
                    'imagen'   => $i->producto_imagen,
                    'label'    => $i->label,
                    'cantidad' => $i->cantidad,
                    'precio'   => $i->precio_unitario,
                ]),
            ],
        ]);
    }

    private function generarCodigo(): string
    {
        do {
            $numero = str_pad((string) random_int(1, 99999), 5, '0', STR_PAD_LEFT);
            $codigo = "LNK-{$numero}";
        } while (Order::where('codigo', $codigo)->exists());

        return $codigo;
    }
}
