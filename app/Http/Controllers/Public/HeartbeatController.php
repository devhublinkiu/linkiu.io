<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\GeoService;
use App\Support\VistaEnVivo\Visitante;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

/**
 * Endpoint llamado cada 30s por las paginas publicas para mantener
 * presencia "online" en Vista en Vivo.
 *
 * Estructura Redis:
 *  - SET "vivo:online" — IPs unicas activas (TTL renovado por entry, 60s)
 *  - HASH "vivo:ciudades" — { 'Bogota' => 12, 'Medellin' => 8, ... }
 *  - El TTL global de cada key se renueva en cada hit.
 *
 * Bots se descartan (mismo filtro que ProductViewsController). Devuelve 204
 * para no inflar logs/respuesta.
 */
class HeartbeatController extends Controller
{
    private const KEY_ONLINE     = 'vivo:online';
    public  const KEY_IP_CIUDAD  = 'vivo:ip-ciudad';   // hash { ip => ciudad } de IPs activas
    public  const KEY_VISITANTES = 'vivo:visitantes';   // hash { sessionId => json del visitante }
    private const KEY_GEO_CACHE  = 'vivo:geo-counted:'; // prefijo para deduplicar lookups geo
    private const KEY_PUBLISH_LOCK = 'vivo:publish-lock';
    public  const TTL_PRESENCIA  = 35;    // 35s — heartbeat cada 30s + 5s de gracia. Si no llega
                                          // en este tiempo se considera desconectado. Combinado
                                          // con el disconnect() explicito da casi-instantaneo.
    private const TTL_GEO_CACHE  = 14400; // 4h — cache del lookup geo por IP (no del conteo)
    private const DEBOUNCE_PUBLISH = 5;   // seg — minimo entre publishes de presencia a Ably

    private const BOT_PATTERNS = [
        'bot', 'crawl', 'spider', 'slurp', 'mediapartners', 'adsbot',
        'headlesschrome', 'phantomjs', 'puppeteer', 'playwright',
        'curl', 'wget', 'python-requests', 'go-http-client',
    ];

    public function tick(Request $request, GeoService $geo): Response
    {
        $ua = strtolower($request->userAgent() ?? '');
        if ($ua === '' || $this->esBot($ua)) {
            return response()->noContent();
        }

        // Identificador del visitante: session ID de Laravel. Cada navegador
        // tiene el suyo, todas las tabs lo comparten. Incognita = otra session.
        // Fallback a IP solo si el visitante deshabilito cookies. La IP igual
        // se usa para el geo lookup (para saber la ciudad).
        $cliente = $request->session()->getId() ?: $request->ip();
        $ip      = $request->ip();
        if (! $cliente) return response()->noContent();

        // Si Redis no esta disponible (local sin redis instalado), respondemos
        // 204 igual — la presencia simplemente no se registra, pero las paginas
        // publicas no rompen.
        try {
            // Presencia: agregamos al sorted set con score = timestamp.
            $ahora = time();
            Redis::zadd(self::KEY_ONLINE, $ahora, $cliente);
            Redis::zremrangebyscore(self::KEY_ONLINE, '-inf', $ahora - self::TTL_PRESENCIA);
            Redis::expire(self::KEY_ONLINE, self::TTL_PRESENCIA * 2);

            // Geo: lookup solo la primera vez por IP (cache 4h). Guardamos
            // {cliente => ciudad} en hash compartido para que el conteo
            // por ciudad refleje las personas REALMENTE conectadas ahora.
            $cacheGeoKey = self::KEY_GEO_CACHE . $ip;
            $ciudadCache = $ip ? Redis::get($cacheGeoKey) : null;

            // Si el cache tiene una ciudad invalida (data corrupta de versiones
            // anteriores), lo borramos para forzar nuevo lookup.
            if ($ciudadCache !== null && $ciudadCache !== '' && ! $this->esCiudadValida($ciudadCache)) {
                Redis::del($cacheGeoKey);
                $ciudadCache = null;
            }

            if ($ciudadCache === null) {
                $datos = $geo->resolverPorIp($ip);
                $ciudadCache = ($datos && $datos['ciudad']) ? $datos['ciudad'] : '';
                if ($ip) Redis::setex($cacheGeoKey, self::TTL_GEO_CACHE, $ciudadCache);
            }
            if ($ciudadCache !== '' && $this->esCiudadValida($ciudadCache)) {
                Redis::hset(self::KEY_IP_CIUDAD, $cliente, $ciudadCache);
                Redis::expire(self::KEY_IP_CIUDAD, self::TTL_PRESENCIA * 4);
                $this->limpiarIpsFantasma();
            }

            // Guardar visitante con todos los metadatos del recorrido.
            $this->guardarVisitante($request, $cliente, $ciudadCache ?: null);

            // Push a Ably con debounce de 5s — sin importar cuantos heartbeats
            // entren, solo se publica al admin maximo 1 vez cada 5s. El SET NX EX
            // es atomico: el primer heartbeat en pasar el lock publica, los demas
            // se descartan silenciosos.
            $this->publicarPresenciaSiToca();
        } catch (\Throwable $e) {
            Log::debug('Heartbeat — Redis no disponible', ['msg' => $e->getMessage()]);
        }

        return response()->noContent();
    }

    /**
     * Guarda/actualiza el visitante en el hash vivo:visitantes. Lee del body
     * del request los campos del recorrido (pagina, seccion, dispositivo,
     * origen, iniciado_en). Si no llegan, usa defaults razonables.
     */
    private function guardarVisitante(Request $request, string $cliente, ?string $ciudad): void
    {
        $visitante = Visitante::desdeRequest(
            sessionId:   $cliente,
            pagina:      (string) $request->input('pagina',      '/'),
            seccion:     $request->input('seccion'),
            dispositivo: (string) $request->input('dispositivo', 'desktop'),
            origen:      (string) $request->input('origen',      'otros'),
            iniciadoEn:  (int)    $request->input('iniciado_en', time()),
            ciudad:      $ciudad,
        );

        Redis::hset(self::KEY_VISITANTES, $cliente, $visitante->toJson());
        Redis::expire(self::KEY_VISITANTES, self::TTL_PRESENCIA * 4);
    }

    /**
     * Llamado por sendBeacon cuando el visitante cierra la pestaña o pasa
     * a background. Elimina la IP del set para que el conteo de "Personas
     * conectadas" baje al instante, sin esperar al TTL.
     */
    public function disconnect(Request $request): Response
    {
        $cliente = $request->session()->getId() ?: $request->ip();
        if (! $cliente) return response()->noContent();

        try {
            Redis::zrem(self::KEY_ONLINE, $cliente);
            Redis::hdel(self::KEY_IP_CIUDAD, $cliente);
            Redis::hdel(self::KEY_VISITANTES, $cliente);
            $this->publicarPresenciaSiToca();
        } catch (\Throwable $e) {
            Log::debug('Heartbeat disconnect — Redis no disponible', ['msg' => $e->getMessage()]);
        }

        return response()->noContent();
    }

    /**
     * Limpia del hash entradas que ya no estan en el sorted set de presencia
     * (porque expiraron sin disconnect explicito — ej. crash del navegador).
     * Best-effort: corre en cada heartbeat sin ser caro porque el hash es chico.
     */
    private function limpiarIpsFantasma(): void
    {
        $activos = Redis::zrangebyscore(self::KEY_ONLINE, time() - self::TTL_PRESENCIA, '+inf') ?: [];

        $clientesCiudad = array_keys(Redis::hgetall(self::KEY_IP_CIUDAD) ?: []);
        $fantasmasC     = array_diff($clientesCiudad, $activos);
        if (! empty($fantasmasC)) {
            Redis::hdel(self::KEY_IP_CIUDAD, ...$fantasmasC);
        }

        $clientesVisit = array_keys(Redis::hgetall(self::KEY_VISITANTES) ?: []);
        $fantasmasV    = array_diff($clientesVisit, $activos);
        if (! empty($fantasmasV)) {
            Redis::hdel(self::KEY_VISITANTES, ...$fantasmasV);
        }
    }

    /**
     * Si pasaron >=5s desde el ultimo publish, calcula presencia + ciudades
     * y publica a Ably. Se llama desde cada heartbeat pero solo "pega" cada 5s.
     */
    private function publicarPresenciaSiToca(): void
    {
        $adquirido = Redis::set(self::KEY_PUBLISH_LOCK, '1', 'EX', self::DEBOUNCE_PUBLISH, 'NX');
        if (! $adquirido) return;

        $online = (int) Redis::zcount(self::KEY_ONLINE, time() - self::TTL_PRESENCIA, '+inf');

        // Ciudades de clientes CONECTADOS AHORA — agrupamos las ciudades del
        // hash tomando solo session IDs que estan en el sorted set (filtra
        // fantasmas).
        $activos      = Redis::zrangebyscore(self::KEY_ONLINE, time() - self::TTL_PRESENCIA, '+inf') ?: [];
        $ciudadesRaw  = $activos
            ? (Redis::hmget(self::KEY_IP_CIUDAD, $activos) ?: [])
            : [];
        $counts = [];
        foreach ($ciudadesRaw as $ciudad) {
            if (! $ciudad || ! self::esCiudadValida($ciudad)) continue;
            $counts[$ciudad] = ($counts[$ciudad] ?? 0) + 1;
        }
        $items = [];
        foreach ($counts as $ciudad => $count) {
            $items[] = ['ciudad' => $ciudad, 'count' => $count];
        }
        usort($items, fn ($a, $b) => $b['count'] <=> $a['count']);
        $ciudades = array_slice($items, 0, 10);

        // Visitantes activos para la tabla de Vista en Vivo.
        $visitantesRaw = $activos ? (Redis::hmget(self::KEY_VISITANTES, $activos) ?: []) : [];
        $visitantes    = [];
        foreach ($visitantesRaw as $json) {
            if (! $json) continue;
            $v = Visitante::fromJson((string) $json);
            if ($v) $visitantes[] = $v->toArray();
        }

        try {
            $ably = new \Ably\AblyRest(config('broadcasting.connections.ably.key'));
            $ably->channels->get('admin-orders')->publish('presencia.actualizada', [
                'online'     => $online,
                'ciudades'   => $ciudades,
                'visitantes' => $visitantes,
            ]);
        } catch (\Throwable $e) {
            Log::error('Heartbeat Ably publish: ' . $e->getMessage());
        }
    }

    private function esBot(string $ua): bool
    {
        foreach (self::BOT_PATTERNS as $patron) {
            if (str_contains($ua, $patron)) return true;
        }
        return false;
    }

    /**
     * Una ciudad valida tiene al menos 2 caracteres y NO es puramente numerica.
     * Filtra valores raros que ipapi.co devolvio en el pasado ('1', '12', etc.)
     * y que pueden estar cacheados desde versiones anteriores del codigo.
     */
    public static function esCiudadValida(string $ciudad): bool
    {
        $ciudad = trim($ciudad);
        return strlen($ciudad) >= 2 && ! ctype_digit($ciudad);
    }
}
