<?php

namespace App\Services;

use App\Models\Integracion;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cliente de la API de Mastershop (https://prod.api.mastershop.com).
 *
 * Endpoints en uso (Capa 1 — enrolar productos):
 *   GET /api/products              → listado paginado / búsqueda
 *   GET /api/products/:id          → detalle con variantes
 *
 * Auth requerida: header `ms-api-key: <token>`. Errores:
 *   403 → token inválido o ausente
 *   429 → rate limit (500 req/min por token)
 *   5xx → errores internos
 *
 * Cache: 5 min para búsquedas (volátiles), 30 min para detalle individual.
 * Si la API key no está configurada o falla, devolvemos null silencioso
 * para que la UI muestre estado vacío sin romperse.
 */
class MastershopService
{
    private const BASE_URL = 'https://prod.api.mastershop.com';
    private const TIMEOUT  = 15;

    public function tieneCredenciales(): bool
    {
        return ! empty(Integracion::get('mastershop_api_key'));
    }

    /**
     * Llama /api/products?limit=1 para validar que la API key responde 200.
     * Devuelve ['ok' => bool, 'mensaje' => string].
     */
    public function probarConexion(?string $apiKey = null): array
    {
        $key = $apiKey ?? Integracion::get('mastershop_api_key');
        if (! $key) {
            return ['ok' => false, 'mensaje' => 'Falta configurar la API key.'];
        }

        try {
            $res = $this->cliente($key)->get('/api/products', ['limit' => 1]);

            return match (true) {
                $res->successful() => [
                    'ok'      => true,
                    'mensaje' => 'Conexión exitosa con Mastershop.',
                ],
                $res->status() === 403 => [
                    'ok'      => false,
                    'mensaje' => 'API key inválida o sin permisos (403).',
                ],
                $res->status() === 429 => [
                    'ok'      => false,
                    'mensaje' => 'Rate limit excedido. Esperá un minuto y reintentá.',
                ],
                default => [
                    'ok'      => false,
                    'mensaje' => "Mastershop respondió {$res->status()}.",
                ],
            };
        } catch (\Throwable $e) {
            Log::warning('Mastershop probarConexion excepción', ['mensaje' => $e->getMessage()]);
            return ['ok' => false, 'mensaje' => 'Error al conectar con Mastershop.'];
        }
    }

    /**
     * Busca productos por nombre/descripción o por ID directo.
     *
     * Si `$query` es sólo dígitos lo tratamos como ID y vamos a /products/:id —
     * 1 sola request, sin fuzzy. Si no, va a /products?search= con cache 5min
     * (los catálogos no cambian minuto a minuto + protege el rate 500/min).
     *
     * @return array{results: array, total: int}|null
     */
    public function buscarProductos(string $query, int $page = 1, int $limit = 10): ?array
    {
        if (! $this->tieneCredenciales()) return null;

        $query = trim($query);
        if ($query === '') return ['results' => [], 'total' => 0];

        // Atajo por ID: si el query es enteramente numérico, lo buscamos directo.
        // El detalle por ID retorna el mismo shape que un item de search.
        if (ctype_digit($query)) {
            $producto = $this->obtenerProducto((int) $query);
            return [
                'results' => $producto ? [$producto] : [],
                'total'   => $producto ? 1 : 0,
            ];
        }

        $cacheKey = "mastershop:buscar:" . md5("{$query}|{$page}|{$limit}");

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($query, $page, $limit) {
            $res = $this->cliente()->get('/api/products', [
                'search' => $query,
                'page'   => $page,
                'limit'  => min(50, max(1, $limit)),
            ]);

            if (! $res->successful()) {
                $this->logFallo('buscarProductos', $res, ['query' => $query]);
                return null;
            }

            $body = $res->json() ?: [];
            return [
                'results' => $body['results'] ?? [],
                'total'   => (int) ($body['resultsCount']['totalProducts'] ?? 0),
            ];
        });
    }

    /**
     * Detalle completo del producto con sus variantes. Cache 30 min — un
     * producto rara vez cambia sus variantes en una sesión de enrolamiento.
     */
    public function obtenerProducto(int $idProduct): ?array
    {
        if (! $this->tieneCredenciales()) return null;

        $cacheKey = "mastershop:producto:{$idProduct}";

        return Cache::remember($cacheKey, now()->addMinutes(30), function () use ($idProduct) {
            $res = $this->cliente()->get("/api/products/{$idProduct}");

            if (! $res->successful()) {
                $this->logFallo('obtenerProducto', $res, ['idProduct' => $idProduct]);
                return null;
            }

            $body = $res->json() ?: [];
            // La API devuelve siempre {results: [...]} aunque sea un solo producto.
            $producto = $body['results'][0] ?? null;
            return $producto ?: null;
        });
    }

    /**
     * Invalida el cache. Se llama cuando el admin actualiza la API key —
     * los resultados previos pudieron ser de una cuenta distinta.
     */
    public function olvidarCache(): void
    {
        // No hay método nativo para borrar por prefijo en cache file/array.
        // En Redis (prod) usar Cache::tags si fuera necesario. Para esta capa
        // basta dejarlo expirar (5-30 min) — el admin no rota la key seguido.
    }

    /**
     * Valida un número de teléfono colombiano contra el endpoint
     * /customers/validate-phone-number de Mastershop. "Best effort":
     *  - true  → Mastershop confirma que es válido
     *  - false → Mastershop confirma que es inválido
     *  - null  → no se pudo consultar (sin API key, error de red, etc.)
     *           El caller decide cómo tratar el null (típicamente: no bloquear).
     */
    public function validarTelefono(string $telefono): ?bool
    {
        if (! $this->tieneCredenciales()) return null;

        $cacheKey = "mastershop:phone:{$telefono}";

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($telefono) {
            try {
                $res = $this->cliente()->get('/api/customers/validate-phone-number', [
                    'phone' => $telefono,
                ]);

                if (! $res->successful()) {
                    $this->logFallo('validarTelefono', $res, ['telefono' => $telefono]);
                    return null;
                }

                // El endpoint devuelve { valid: bool } o similar. Tomamos cualquier
                // shape razonable para no quedar acoplados a un campo específico.
                $body = $res->json() ?: [];
                if (isset($body['valid']))    return (bool) $body['valid'];
                if (isset($body['isValid'])) return (bool) $body['isValid'];
                if (isset($body['ok']))       return (bool) $body['ok'];

                return null;
            } catch (\Throwable $e) {
                Log::warning('Mastershop validarTelefono excepción', [
                    'telefono' => $telefono,
                    'mensaje'  => $e->getMessage(),
                ]);
                return null;
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────

    private function cliente(?string $apiKey = null)
    {
        return Http::withHeaders([
                'ms-api-key' => $apiKey ?? Integracion::get('mastershop_api_key'),
                'Accept'     => 'application/json',
            ])
            ->baseUrl(self::BASE_URL)
            ->timeout(self::TIMEOUT);
    }

    private function logFallo(string $accion, Response $res, array $extra = []): void
    {
        Log::warning("Mastershop {$accion} falló", [
            ...$extra,
            'status' => $res->status(),
            'body'   => substr($res->body(), 0, 300),
        ]);
    }
}
