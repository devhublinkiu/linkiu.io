<?php

namespace App\Services;

use App\Models\BuildConfig;
use App\Models\Integracion;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cliente de la API v2 de Mipaquete para cotización de envíos.
 *
 * Solo dos endpoints en uso:
 *   GET  /getLocations?locationCode=DANE   → resuelve nombre de ciudad/dpto
 *   POST /quoteShipping                    → cotiza con todas las transportadoras
 *
 * Auth requerida (ambos headers):
 *   apikey:          JWT — guardada cifrada en Integracion
 *   session-tracker: UUID público del sandbox (en config/services.php)
 *
 * Cache por par (origen → destino) en Redis. Si la API falla, devuelve null
 * silencioso para que la UI no se rompa.
 */
class MipaqueteService
{
    public function tieneCredenciales(): bool
    {
        return ! empty(Integracion::get('mipaquete_api_key'));
    }

    /**
     * Resuelve un código DANE a su nombre + departamento. Cacheado 7 días
     * porque los códigos DANE no cambian.
     */
    public function resolverCiudad(string $locationCode): ?array
    {
        if (! $this->tieneCredenciales()) return null;

        return Cache::remember(
            "mipaquete:location:{$locationCode}",
            now()->addDays(7),
            function () use ($locationCode) {
                $res = $this->cliente()->get('/getLocations', ['locationCode' => $locationCode]);

                if ($res->failed()) {
                    Log::warning('Mipaquete getLocations falló', [
                        'code'   => $locationCode,
                        'status' => $res->status(),
                    ]);
                    return null;
                }

                $body = $res->json();
                return is_array($body) && ! empty($body) ? $body[0] : null;
            },
        );
    }

    /**
     * Cotiza un envío y devuelve la lista de transportadoras con precio + tiempo.
     * Cache 24h (o lo que defina config).
     *
     * @return array{transportadoras: array, min: int, max: int}|null
     */
    public function cotizar(string $origenCode, string $destinoCode): ?array
    {
        if (! $this->tieneCredenciales()) return null;

        $presetKey = BuildConfig::get('envio_paquete_preset', 'pequeno');
        $preset    = config("services.mipaquete.presets.{$presetKey}")
                  ?? config('services.mipaquete.presets.pequeno');

        $cacheKey = "mipaquete:quote:{$origenCode}:{$destinoCode}:{$presetKey}";

        return Cache::remember(
            $cacheKey,
            (int) config('services.mipaquete.cache_ttl', 86400),
            function () use ($origenCode, $destinoCode, $preset) {
                $res = $this->cliente()->post('/quoteShipping', [
                    'originLocationCode'  => $origenCode,
                    'destinyLocationCode' => $destinoCode,
                    'height'              => (int) $preset['height'],
                    'width'               => (int) $preset['width'],
                    'length'              => (int) $preset['length'],
                    'weight'              => (int) $preset['weight'],
                    'quantity'            => 1,
                    'declaredValue'       => (int) $preset['declaredValue'],
                    'saleValue'           => (int) $preset['declaredValue'],
                ]);

                if ($res->failed()) {
                    Log::warning('Mipaquete quoteShipping falló', [
                        'origen'  => $origenCode,
                        'destino' => $destinoCode,
                        'status'  => $res->status(),
                        'body'    => substr($res->body(), 0, 300),
                    ]);
                    return null;
                }

                $transportadoras = $res->json() ?: [];
                if (empty($transportadoras)) return null;

                $precios = array_map(fn ($t) => (int) ($t['shippingCost'] ?? 0), $transportadoras);
                $precios = array_filter($precios, fn ($p) => $p > 0);

                if (empty($precios)) return null;

                return [
                    'transportadoras' => array_map(fn ($t) => [
                        'nombre'        => $t['deliveryCompanyName']   ?? '?',
                        'logo'          => $t['deliveryCompanyImgUrl'] ?? null,
                        'precio'        => (int) ($t['shippingCost']   ?? 0),
                        'tiempoMinutos' => (int) ($t['shippingTime']   ?? 0),
                        'score'         => (int) ($t['score']          ?? 0),
                    ], $transportadoras),
                    'min' => min($precios),
                    'max' => max($precios),
                ];
            },
        );
    }

    /**
     * Cotiza en bloque desde la bodega configurada hacia varios códigos
     * destino. Útil para precomputar el modal de zonas: el admin recibe un
     * mapa `[codigo => {min, max, ...}]` y los muestra como badges.
     *
     * @param  string[] $destinos  Códigos DANE
     * @return array<string, array|null>
     */
    public function cotizarMultiple(array $destinos): array
    {
        $origenCode = BuildConfig::get('envio_bodega_dane_code');
        if (! $origenCode) return [];

        $resultado = [];
        foreach ($destinos as $destino) {
            $resultado[$destino] = $this->cotizar($origenCode, (string) $destino);
        }
        return $resultado;
    }

    // ─────────────────────────────────────────────────────────────────────

    private function cliente()
    {
        return Http::withHeaders([
                'apikey'          => Integracion::get('mipaquete_api_key'),
                'session-tracker' => config('services.mipaquete.session_tracker'),
                'Accept'          => 'application/json',
            ])
            ->baseUrl((string) config('services.mipaquete.base_url'))
            ->timeout((int) config('services.mipaquete.timeout', 15));
    }
}
