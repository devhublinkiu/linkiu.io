<?php

namespace App\Http\Controllers;

use App\Actions\Orders\CrearOrden;
use App\Http\Requests\Bold\IniciarPagoBoldRequest;
use App\Jobs\NotificarOrdenCreada;
use App\Models\Order;
use App\Services\BoldService;
use App\Services\EnvioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Pasarela Bold (Colombia) — flujo embebido vía SDK JS BoldCheckout.
 *
 * 1) Frontend POST /api/bold/iniciar  → backend crea orden 'pendiente' y
 *    devuelve config con integrity_signature para el SDK.
 * 2) Frontend instancia `new BoldCheckout({...})` y abre modal iframe.
 * 3) Cliente paga dentro del iframe.
 * 4) Bold POST /webhooks/bold → backend valida HMAC x-bold-signature y
 *    marca la orden como 'confirmado' (notificando al cliente y al dueño).
 * 5) Bold redirige a /orden/{token}/gracias (configurado en redirectionUrl).
 */
class BoldController extends Controller
{
    public function __construct(
        private BoldService $bold,
        private CrearOrden $crearOrden,
        private EnvioService $envioService,
    ) {}

    // -------------------------------------------------------------------------
    // POST /api/bold/iniciar
    // -------------------------------------------------------------------------
    public function iniciar(IniciarPagoBoldRequest $request): JsonResponse
    {
        if (! $this->bold->tieneCredenciales()) {
            return response()->json([
                'error' => 'Bold no está configurado. Contacta al soporte de la tienda.',
            ], 422);
        }

        $data = $request->validated();

        // Defensa anti-tampering: recalcular costo de envío y total con
        // EnvioService. Si el cliente manipuló costo_envio=0 desde la
        // consola, abortamos antes de generar la integrity_signature.
        $costoEnvioReal = $this->envioService->calcularCostoEnvio(
            ciudad:   $data['order']['ciudad'],
            subtotal: (int) $data['order']['subtotal'],
        );

        if ($costoEnvioReal === null) {
            return response()->json(['error' => 'La ciudad no tiene cobertura de envío.'], 422);
        }

        $totalReal = (int) $data['order']['subtotal'] + $costoEnvioReal + (int) $data['order']['recargo'];

        if ((int) $data['order']['total'] !== $totalReal) {
            Log::warning('Bold iniciar: total cliente difiere del recalculado', [
                'email'         => $data['order']['email'],
                'total_cliente' => $data['order']['total'],
                'total_real'    => $totalReal,
            ]);
            return response()->json([
                'error' => 'El total del pedido cambió. Recarga la página y vuelve a intentar.',
            ], 422);
        }

        $data['order']['costo_envio'] = $costoEnvioReal;
        $data['order']['total']       = $totalReal;

        // La orden se crea PENDIENTE y sin notificar — esperamos el webhook
        // approved para mover a confirmado y notificar al cliente.
        $orden = $this->crearOrden->execute(
            data: [...$data['order'], 'metodo_pago' => 'bold'],
            extra: [],
            estadoInicial: 'pendiente',
            notificar:     false,
        );

        // Generamos integrity signature con el codigo de la orden como orderId.
        $integritySignature = $this->bold->generarIntegritySignature(
            orderId: $orden->codigo,
            amount:  $orden->total,
            currency: 'COP',
        );

        return response()->json([
            'order_id'            => $orden->codigo,
            'acceso_token'        => $orden->acceso_token,
            'amount'              => (string) $orden->total,
            'currency'            => 'COP',
            'api_key'             => $this->bold->obtenerIdentityKey(),
            'integrity_signature' => $integritySignature,
            'description'         => 'Pedido ' . $orden->codigo,
            'redirection_url'     => route('orden.confirmacion', ['order' => $orden->acceso_token]),
        ]);
    }

    // -------------------------------------------------------------------------
    // POST /webhooks/bold
    // -------------------------------------------------------------------------
    public function webhook(Request $request): JsonResponse
    {
        $signature = $request->header('x-bold-signature', '');
        $rawBody   = $request->getContent();

        if (! $this->bold->verificarWebhook($signature, $rawBody)) {
            Log::warning('Bold webhook firma inválida', [
                'ip'        => $request->ip(),
                'tiene_sig' => (bool) $signature,
            ]);
            return response()->json(['ok' => false], 401);
        }

        $payload = $request->all();
        $type    = $payload['type'] ?? null;
        $data    = $payload['data'] ?? [];

        // El payment_id viene en data.payment_id, la referencia interna
        // (nuestro orden.codigo) en data.metadata.reference o similar.
        $boldPaymentId = (string) ($data['payment_id'] ?? $payload['subject'] ?? '');
        $orderRef      = (string) ($data['metadata']['reference'] ?? $data['reference'] ?? '');

        // Buscamos la orden por su código (orden_id que generamos en iniciar).
        $orden = $orderRef ? Order::where('codigo', $orderRef)->first() : null;

        if (! $orden) {
            Log::info('Bold webhook recibido sin orden asociada', ['ref' => $orderRef, 'payment_id' => $boldPaymentId]);
            return response()->json(['ok' => true]);
        }

        $orden->bold_payment_id = $boldPaymentId ?: $orden->bold_payment_id;

        match ($type) {
            'SALE_APPROVED' => $this->procesarAprobado($orden),
            'SALE_REJECTED' => $this->procesarRechazado($orden),
            'VOID_APPROVED' => $this->procesarReverso($orden),
            default         => $orden->save(),
        };

        return response()->json(['ok' => true]);
    }

    // -------------------------------------------------------------------------

    private function procesarAprobado(Order $orden): void
    {
        // Idempotencia: si ya notificamos, no duplicamos. Bold reenvía
        // webhooks ante respuestas no-2xx hasta confirmación.
        if ($orden->bold_notificado_at !== null) {
            $orden->save();
            return;
        }

        $orden->bold_status        = 'approved';
        $orden->estado             = 'confirmado';
        $orden->bold_notificado_at = now();
        $orden->save();

        NotificarOrdenCreada::dispatch($orden);
    }

    private function procesarRechazado(Order $orden): void
    {
        $orden->bold_status = 'rejected';
        $orden->estado      = 'cancelado';
        $orden->save();
    }

    private function procesarReverso(Order $orden): void
    {
        $orden->bold_status = 'voided';
        $orden->estado      = 'cancelado';
        $orden->save();
    }
}
