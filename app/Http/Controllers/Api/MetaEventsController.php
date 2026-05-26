<?php

namespace App\Http\Controllers\Api;

use App\Actions\Meta\EnviarEventoMeta;
use App\Enums\MetaEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Meta\EnviarEventoRequest;
use App\Jobs\EnviarEventoMetaJob;
use App\Models\Integracion;
use App\Support\Meta\MetaHashHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Endpoints públicos del CAPI bridge.
 *
 * - dispatch: el frontend lo llama tras cada trackFb del Pixel. El server
 *   enriquece user_data con info que solo conoce él (IP real, UA, cookies _fbp/_fbc,
 *   hashing PII) y despacha el job async.
 *
 * - probarConexion: el admin lo llama desde la UI de Pixeles. Manda un evento
 *   `Lead` (de prueba — Lead es ligero) con test_event_code random. El admin verifica
 *   en Events Manager → Test Events que llegó.
 */
class MetaEventsController extends Controller
{
    public function dispatch(EnviarEventoRequest $request): JsonResponse
    {
        // Sin pixel_id o access_token configurados → no-op silencioso.
        // El Pixel client-side sigue funcionando; CAPI simplemente no se dispara.
        if (! Integracion::get('fb_pixel_id') || ! Integracion::get('fb_access_token')) {
            return response()->json(['ok' => true, 'sent' => false], 204);
        }

        $validated = $request->validated();

        $userData = $this->enriquecerUserData($request, $validated['user_data'] ?? []);

        EnviarEventoMetaJob::dispatch(
            eventName:      $validated['event_name'],
            eventId:        $validated['event_id'],
            eventTime:      time(),
            eventSourceUrl: $validated['event_source_url'],
            userData:       $userData,
            customData:     $validated['custom_data'] ?? [],
            testEventCode:  $validated['test_event_code'] ?? null,
        );

        return response()->json(['ok' => true, 'sent' => true]);
    }

    public function probarConexion(Request $request, EnviarEventoMeta $action): JsonResponse
    {
        abort_unless($request->user()?->can('integraciones.editar'), 403);

        if (! Integracion::get('fb_pixel_id') || ! Integracion::get('fb_access_token')) {
            return response()->json([
                'ok'      => false,
                'mensaje' => 'Falta configurar Pixel ID o Access Token.',
            ], 422);
        }

        $testCode = 'TEST_' . strtoupper(Str::random(8));

        $ok = $action->execute(
            eventName:      MetaEvent::Lead->value,
            eventId:        (string) Str::uuid(),
            eventTime:      time(),
            eventSourceUrl: $request->root(),
            userData:       $this->enriquecerUserData($request, []),
            customData:     ['value' => 0, 'currency' => 'COP'],
            testEventCode:  $testCode,
        );

        return response()->json([
            'ok'        => $ok,
            'test_code' => $testCode,
            'mensaje'   => $ok
                ? 'Evento de prueba enviado. Verifica en Events Manager → Test Events.'
                : 'Meta no aceptó el evento. Revisa Pixel ID y Access Token.',
        ]);
    }

    /**
     * Combina los datos PII que el frontend mandó (en texto plano) con info
     * que solo el server tiene (IP, UA, cookies). Hashea todo lo PII.
     */
    private function enriquecerUserData(Request $request, array $cliente): array
    {
        return [
            'em'                 => MetaHashHelper::email($cliente['email']      ?? null),
            'ph'                 => MetaHashHelper::phone($cliente['phone']      ?? null),
            'fn'                 => MetaHashHelper::nombre($cliente['first_name']?? null),
            'ln'                 => MetaHashHelper::nombre($cliente['last_name'] ?? null),
            'external_id'        => MetaHashHelper::externalId($cliente['external_id'] ?? (string) $request->user()?->id),
            'client_ip_address'  => $request->ip(),
            'client_user_agent'  => substr((string) $request->userAgent(), 0, 500),
            'fbp'                => $request->cookie('_fbp'),
            'fbc'                => $request->cookie('_fbc'),
        ];
    }
}
