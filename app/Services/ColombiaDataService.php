<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Wrapper cacheado sobre api-colombia.com.
 *
 * El admin usa esta data para definir zonas de envío (departamentos + ciudades).
 * La data es prácticamente estática — los códigos DANE no cambian — así que
 * cachear 24h reduce ~1100 ciudades × N admins/día a un solo hit externo diario
 * y nos blinda ante caídas momentáneas de la API externa.
 *
 * Contrato de salida (mismo shape que esperaba el frontend antes del refactor):
 *   ['departamentos' => [['id' => int, 'name' => string], ...],
 *    'ciudades'      => [['id' => int, 'name' => string, 'departmentId' => int], ...]]
 */
class ColombiaDataService
{
    private const CACHE_KEY      = 'colombia_data';
    private const CACHE_TTL_SECS = 86400;  // 24 horas
    private const API_BASE       = 'https://api-colombia.com/api/v1';
    private const TIMEOUT_SECS   = 10;

    /**
     * @throws \RuntimeException si la API externa falla y no hay cache previo.
     * @return array{departamentos: array<int, array{id: int, name: string}>, ciudades: array<int, array{id: int, name: string, departmentId: int}>}
     */
    public function obtener(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL_SECS, function () {
            return $this->fetchExterno();
        });
    }

    /**
     * Forzar refresh del cache (admin opcional, no hay UI para esto aún —
     * útil para tinker si se detecta data corrupta o si api-colombia agrega
     * municipios nuevos durante el TTL).
     */
    public function refrescar(): array
    {
        Cache::forget(self::CACHE_KEY);
        return $this->obtener();
    }

    /**
     * @throws \RuntimeException
     */
    private function fetchExterno(): array
    {
        try {
            [$dptoResp, $cityResp] = Http::pool(fn ($pool) => [
                $pool->timeout(self::TIMEOUT_SECS)->get(self::API_BASE . '/Department'),
                $pool->timeout(self::TIMEOUT_SECS)->get(self::API_BASE . '/City'),
            ]);

            if (! $dptoResp->successful() || ! $cityResp->successful()) {
                throw new \RuntimeException(
                    'api-colombia.com respondió con status ' . $dptoResp->status() . '/' . $cityResp->status(),
                );
            }

            return [
                'departamentos' => $this->normalizarDepartamentos($dptoResp->json()),
                'ciudades'      => $this->normalizarCiudades($cityResp->json()),
            ];
        } catch (\Throwable $e) {
            Log::warning('ColombiaDataService fetch falló: ' . $e->getMessage());
            throw new \RuntimeException('No se pudo obtener la lista de departamentos y ciudades.', 0, $e);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $raw
     * @return array<int, array{id: int, name: string}>
     */
    private function normalizarDepartamentos(array $raw): array
    {
        return array_values(array_map(
            fn ($d) => ['id' => (int) $d['id'], 'name' => (string) $d['name']],
            $raw,
        ));
    }

    /**
     * @param  array<int, array<string, mixed>>  $raw
     * @return array<int, array{id: int, name: string, departmentId: int}>
     */
    private function normalizarCiudades(array $raw): array
    {
        return array_values(array_map(
            fn ($c) => [
                'id'           => (int) $c['id'],
                'name'         => (string) $c['name'],
                'departmentId' => (int) $c['departmentId'],
            ],
            $raw,
        ));
    }
}
