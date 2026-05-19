<?php

namespace App\Http\Controllers;

use App\Mail\OrdenConfirmadaMail;
use App\Models\Client;
use App\Models\Order;
use App\Services\MercadoPagoService;
use App\Services\SendPulseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class MercadoPagoController extends Controller
{
    public function __construct(
        private MercadoPagoService $mp,
        private SendPulseService $sendPulse,
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
            'order.items.*.producto_id'              => 'nullable|integer|exists:productos,id',
        ]);

        try {
            $resultado = $this->mp->crearPago(
                formData:        $data['form_data'],
                descripcion:     'Pedido Linkiu',
                notificationUrl: route('mp.webhook'),
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

        // Crear la orden en la BD
        $orden = DB::transaction(function () use ($data, $resultado) {
            $cliente = Client::updateOrCreate(
                ['email' => $data['order']['email']],
                [
                    'nombre'   => $data['order']['nombre'],
                    'apellido' => $data['order']['apellido'],
                    'telefono' => $data['order']['telefono'],
                ],
            );

            $orden = Order::create([
                'codigo'           => $this->generarCodigo(),
                'client_id'        => $cliente->id,
                'estado'           => $resultado['status'] === 'approved' ? 'confirmado' : 'pendiente',
                'metodo_pago'      => 'mercadopago',
                'mp_payment_id'    => (string) $resultado['id'],
                'mp_status'        => $resultado['status'],
                'mp_status_detail' => $resultado['status_detail'],
                'subtotal'         => $data['order']['subtotal'],
                'costo_envio'      => $data['order']['costo_envio'],
                'recargo'          => $data['order']['recargo'],
                'total'            => $data['order']['total'],
                'nombre'           => $data['order']['nombre'],
                'apellido'         => $data['order']['apellido'],
                'email'            => $data['order']['email'],
                'telefono'         => $data['order']['telefono'],
                'departamento'     => $data['order']['departamento'],
                'ciudad'           => $data['order']['ciudad'],
                'direccion'        => $data['order']['direccion'],
                'apartamento'      => $data['order']['apartamento'] ?? null,
                'notas'            => $data['order']['notas'] ?? null,
            ]);

            foreach ($data['order']['items'] as $item) {
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

        // Notificación en tiempo real al admin
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
            Log::error('Ably publish MP NuevoOrden: ' . $e->getMessage());
        }

        // Enviar email y WhatsApp solo si ya está aprobado
        if ($status === 'approved') {
            try {
                Mail::to($orden->email)->send(new OrdenConfirmadaMail($orden));
            } catch (\Exception $e) {
                Log::error('OrdenConfirmadaMail MP: ' . $e->getMessage());
            }
            try {
                $this->sendPulse->notificarOrdenCreada($orden);
            } catch (\Exception $e) {
                Log::error('SendPulse notificarOrdenCreada MP: ' . $e->getMessage());
            }
        }

        return response()->json([
            'status'                => $status,
            'status_detail'         => $resultado['status_detail'],
            'codigo'                => $orden->codigo,
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

        if ($xSignature && ! $this->mp->verificarWebhook($xSignature, $xRequestId, $dataId)) {
            Log::warning('MP webhook firma inválida');
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

        if ($pago['status'] === 'approved') {
            $orden->estado = 'confirmado';
            try {
                Mail::to($orden->email)->send(new OrdenConfirmadaMail($orden));
            } catch (\Exception $e) {
                Log::error('OrdenConfirmadaMail Webhook: ' . $e->getMessage());
            }
            try {
                $this->sendPulse->notificarOrdenCreada($orden);
            } catch (\Exception $e) {
                Log::error('SendPulse notificarOrdenCreada Webhook: ' . $e->getMessage());
            }
        } elseif (in_array($pago['status'], ['rejected', 'cancelled'])) {
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

    private function generarCodigo(): string
    {
        do {
            $numero = str_pad((string) random_int(1, 99999), 5, '0', STR_PAD_LEFT);
            $codigo = "LNK-{$numero}";
        } while (Order::where('codigo', $codigo)->exists());
        return $codigo;
    }

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
