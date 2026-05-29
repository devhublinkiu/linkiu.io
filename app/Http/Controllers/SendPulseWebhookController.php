<?php

namespace App\Http\Controllers;

use App\Actions\Orders\UpdateOrderEstado;
use App\Models\Integracion;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Recibe respuestas de los botones Quick Reply de la plantilla
 * `order_received_cod_v1`. SendPulse envía un array de eventos (uno por
 * interacción), con `title` que identifica la acción:
 *
 *   - "order_confirm_cod" → cliente presionó "Sí, confirmo"
 *   - "order_cancel_cod"  → cliente presionó "No, cancelar"
 *
 * Cada evento incluye `contact.phone` (con código país, sin "+") y un
 * `message.id` único de WhatsApp que usamos para idempotencia.
 *
 * Seguridad:
 *   - Token aleatorio en query string (?token=...) — validado contra
 *     `Integracion::get('sendpulse_webhook_token')`.
 *   - Filtro por service=whatsapp + titles válidos.
 *   - El match por orden requiere `confirmacion_solicitada_at` reciente,
 *     limita ventanas de ataque.
 */
class SendPulseWebhookController extends Controller
{
    private const TITLES_VALIDOS = ['order_confirm_cod', 'order_cancel_cod'];

    public function handle(Request $request, UpdateOrderEstado $updateEstado): JsonResponse
    {
        $token = (string) $request->query('token');
        $configurado = Integracion::get('sendpulse_webhook_token');

        if ($configurado === null || $token !== $configurado) {
            Log::warning('SendPulse webhook: token inválido', ['ip' => $request->ip()]);
            return response()->json(['ok' => false], 403);
        }

        // SendPulse envía un array de eventos. La doc lo deja claro y nuestros
        // tests confirman el shape [{...}].
        $eventos = $request->json()->all();
        if (! is_array($eventos)) {
            $eventos = [];
        }

        foreach ($eventos as $evento) {
            try {
                $this->procesarEvento($evento, $updateEstado);
            } catch (\Throwable $e) {
                // Una falla en un evento no detiene el resto. SendPulse no
                // retransmite si devolvemos 5xx, así que respondemos 200
                // siempre y dejamos el error en log.
                Log::error('SendPulse webhook: excepción procesando evento', [
                    'mensaje' => $e->getMessage(),
                    'evento'  => $evento,
                ]);
            }
        }

        return response()->json(['ok' => true]);
    }

    private function procesarEvento(array $evento, UpdateOrderEstado $updateEstado): void
    {
        if (($evento['service'] ?? null) !== 'whatsapp') {
            return;
        }

        $title = $evento['title'] ?? null;
        if (! in_array($title, self::TITLES_VALIDOS, true)) {
            return;
        }

        $telefonoMs = (string) ($evento['contact']['phone'] ?? '');
        if ($telefonoMs === '') {
            Log::info('SendPulse webhook: evento sin teléfono', ['title' => $title]);
            return;
        }

        // Idempotencia: el message.id de WhatsApp es único y estable. Si lo
        // procesamos antes, descartamos. Cache 7 días — más que suficiente
        // para cubrir retransmisiones.
        $messageId = data_get($evento, 'contact.last_message_data.message.id');
        if ($messageId) {
            $cacheKey = "sp:wh:{$messageId}";
            if (Cache::has($cacheKey)) {
                return;
            }
            Cache::put($cacheKey, true, now()->addDays(7));
        }

        $orden = $this->buscarOrdenEsperandoConfirmacion($telefonoMs);
        if (! $orden) {
            Log::info('SendPulse webhook: sin orden COD esperando confirmación', [
                'telefono' => $telefonoMs,
                'title'    => $title,
            ]);
            return;
        }

        $orden->update([
            'confirmacion_respondida_at' => now(),
            'confirmacion_respuesta'     => $title === 'order_confirm_cod' ? 'si' : 'no',
        ]);

        // Cambio de estado vía UpdateOrderEstado para que dispare las plantillas
        // estándar (order_confirmed u order_cancelled) — el cliente recibe el
        // mensaje correspondiente automáticamente.
        if ($title === 'order_confirm_cod') {
            $updateEstado->execute($orden->fresh(), 'confirmado');
        } else {
            $updateEstado->execute(
                order:             $orden->fresh(),
                estado:            'cancelado',
                motivoCancelacion: 'Cancelado por el cliente desde WhatsApp',
            );
        }
    }

    /**
     * Busca la orden COD del cliente que está esperando confirmación. El
     * teléfono en BD puede estar con o sin código país — comparamos ambos.
     * Ventana de 7 días para limitar el alcance.
     */
    private function buscarOrdenEsperandoConfirmacion(string $telefonoMs): ?Order
    {
        $telefonoSinCodigo = preg_replace('/^57/', '', $telefonoMs);

        return Order::query()
            ->where('metodo_pago', 'contraentrega')
            ->whereNotNull('confirmacion_solicitada_at')
            ->whereNull('confirmacion_respondida_at')
            ->where('confirmacion_solicitada_at', '>=', now()->subDays(7))
            ->where(function ($q) use ($telefonoMs, $telefonoSinCodigo) {
                $q->where('telefono', $telefonoMs)
                  ->orWhere('telefono', $telefonoSinCodigo);
            })
            ->orderByDesc('confirmacion_solicitada_at')
            ->first();
    }
}
