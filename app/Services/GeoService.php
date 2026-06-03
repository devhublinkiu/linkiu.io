<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Resuelve IP -> ciudad / pais usando ipapi.co (free, 1000 req/dia).
 * Cachea agresivo en Redis con TTL 24h por IP — la mayoria de los heartbeats
 * de un mismo visitante van a hit cache despues del primero.
 *
 * Si el servicio falla o la IP es privada/invalida, devuelve null silencioso.
 * El caller decide que hacer (tipicamente no contar la ciudad).
 */
class GeoService
{
    private const CACHE_TTL = 86400;  // 24h

    public function resolverPorIp(?string $ip): ?array
    {
        if (! $ip || $this->esIpPrivada($ip)) {
            return null;
        }

        return Cache::remember("geo:{$ip}", self::CACHE_TTL, function () use ($ip) {
            try {
                $res = Http::timeout(3)->get("https://ipapi.co/{$ip}/json/");

                if (! $res->successful()) {
                    return null;
                }

                $data   = $res->json() ?: [];
                $ciudad = trim((string) ($data['city'] ?? ''));
                $pais   = trim((string) ($data['country_code'] ?? ''));

                // Sanitizar: ipapi.co a veces devuelve valores raros ("1", "",
                // codigos cortos). Solo aceptamos strings que parecen un nombre
                // de ciudad real (>=2 chars y no puramente numerico).
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
            } catch (\Throwable $e) {
                Log::debug('GeoService falla', ['ip' => $ip, 'msg' => $e->getMessage()]);
                return null;
            }
        });
    }

    private function esIpPrivada(string $ip): bool
    {
        return ! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
    }
}
