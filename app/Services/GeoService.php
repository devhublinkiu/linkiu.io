<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Resuelve IP -> ciudad / pais 100% local usando GeoLite2-City de MaxMind.
 *
 * El archivo MMDB se descarga via `php artisan linkiu:geoip:actualizar` y se
 * almacena en storage/app/geoip/GeoLite2-City.mmdb (no commitea, gitignored).
 *
 * Cache Redis por IP (4h) — aunque el lookup MMDB es de ~1-2ms, evitar
 * reabrir el archivo en cada heartbeat ahorra ms en peak.
 *
 * Si el archivo no esta descargado o la libreria no esta instalada, devuelve
 * null silencioso. Mejora gradualmente cuando se descarga.
 */
class GeoService
{
    private const CACHE_TTL = 86400;  // 24h

    private static ?\GeoIp2\Database\Reader $reader = null;

    public function resolverPorIp(?string $ip): ?array
    {
        if (! $ip || $this->esIpPrivada($ip)) {
            return null;
        }

        return Cache::remember("geo:{$ip}", self::CACHE_TTL, function () use ($ip) {
            return $this->lookup($ip);
        });
    }

    /**
     * Hace el lookup en el archivo MMDB. Devuelve null si no hay archivo,
     * libreria no instalada, o IP no encontrada en la BD.
     */
    private function lookup(string $ip): ?array
    {
        try {
            $reader = $this->reader();
            if (! $reader) return null;

            $record = $reader->city($ip);

            $ciudad = trim((string) ($record->city->name ?? ''));
            $pais   = trim((string) ($record->country->isoCode ?? ''));

            // Sanitizacion: rechaza valores raros (residuo de versiones
            // anteriores con ipapi.co) — ciudades muy cortas o solo digitos.
            if (
                strlen($ciudad) < 2
                || ctype_digit($ciudad)
                || strlen($pais) !== 2
            ) {
                return null;
            }

            return [
                'ciudad' => substr($ciudad, 0, 80),
                'pais'   => strtoupper(substr($pais, 0, 2)),
            ];
        } catch (\GeoIp2\Exception\AddressNotFoundException) {
            return null;  // IP no esta en la BD (normal para IPs nuevas / privadas / reservadas)
        } catch (\Throwable $e) {
            Log::debug('GeoService falla', ['ip' => $ip, 'msg' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Reader singleton — abrir el MMDB es caro, lo reutilizamos por request.
     */
    private function reader(): ?\GeoIp2\Database\Reader
    {
        if (self::$reader !== null) return self::$reader;

        if (! class_exists(\GeoIp2\Database\Reader::class)) {
            return null;  // libreria geoip2/geoip2 no instalada
        }

        $path = storage_path('app/geoip/GeoLite2-City.mmdb');
        if (! file_exists($path)) {
            return null;  // archivo no descargado todavia
        }

        try {
            self::$reader = new \GeoIp2\Database\Reader($path);
            return self::$reader;
        } catch (\Throwable $e) {
            Log::warning('GeoService no pudo abrir MMDB', ['msg' => $e->getMessage()]);
            return null;
        }
    }

    private function esIpPrivada(string $ip): bool
    {
        return ! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
    }
}
