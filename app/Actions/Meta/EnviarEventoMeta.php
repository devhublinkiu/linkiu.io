<?php

namespace App\Actions\Meta;

use App\Models\Integracion;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cliente síncrono de Conversions API de Meta.
 *
 * Espera datos ya enriquecidos (user_data hasheado + ip/ua/cookies del server).
 * Si falta pixel_id o access_token, no hace nada (el caller no debería invocar
 * en ese caso, pero defendemos).
 *
 * Se invoca SIEMPRE desde el job — nunca en el request principal — para no
 * bloquear UX si Meta tarda en responder o se cae.
 *
 * Ref: https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api
 */
class EnviarEventoMeta
{
    private const GRAPH_VERSION = 'v21.0';
    private const TIMEOUT       = 8;   // segundos

    public function execute(
        string $eventName,
        string $eventId,
        int $eventTime,
        string $eventSourceUrl,
        array $userData,
        array $customData = [],
        ?string $testEventCode = null,
    ): bool {
        $pixelId = Integracion::get('fb_pixel_id');
        $token   = Integracion::get('fb_access_token');

        if (! $pixelId || ! $token) {
            return false;
        }

        $payload = [
            'data' => [[
                'event_name'        => $eventName,
                'event_id'          => $eventId,
                'event_time'        => $eventTime,
                'event_source_url'  => $eventSourceUrl,
                'action_source'     => 'website',
                'user_data'         => array_filter($userData, fn ($v) => $v !== null && $v !== ''),
                'custom_data'       => array_filter($customData, fn ($v) => $v !== null && $v !== ''),
            ]],
        ];

        if ($testEventCode) {
            $payload['test_event_code'] = $testEventCode;
        }

        try {
            $response = Http::timeout(self::TIMEOUT)
                ->retry(2, 500, throw: false)
                ->withToken($token)
                ->post(
                    sprintf('https://graph.facebook.com/%s/%s/events', self::GRAPH_VERSION, $pixelId),
                    $payload,
                );

            if ($response->successful()) {
                return true;
            }

            // Log warning con detalle pero sin tumbar la app.
            Log::warning('Meta CAPI respondió con error', [
                'event'  => $eventName,
                'status' => $response->status(),
                'body'   => $response->json() ?? $response->body(),
            ]);
            return false;
        } catch (\Throwable $e) {
            Log::error('Meta CAPI excepción', [
                'event'   => $eventName,
                'message' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
