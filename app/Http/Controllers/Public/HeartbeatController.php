<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\GeoService;
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

        $ip = $request->ip();
        if (! $ip) return response()->noContent();

        // Si Redis no esta disponible (local sin redis instalado), respondemos
        // 204 igual — la presencia simplemente no se registra, pero las paginas
        // publicas no rompen.
        try {
            // Presencia: agregamos IP al sorted set con score = timestamp.
            // Asi podemos limpiar las viejas con ZREMRANGEBYSCORE periodicamente,
            // y contar "online ahora" con ZCOUNT de los ultimos 60s.
            $ahora = time();
            Redis::zadd(self::KEY_ONLINE, $ahora, $ip);
            Redis::zremrangebyscore(self::KEY_ONLINE, '-inf', $ahora - self::TTL_PRESENCIA);
            Redis::expire(self::KEY_ONLINE, self::TTL_PRESENCIA * 2);

            // Geo: lookup solo la primera vez por IP (cache 4h). Una vez
            // resuelto, guardamos {ip => ciudad} en hash compartido. La
            // ciudad de cada IP se mantiene mientras la IP siga conectada;
            // cuando se desconecta (disconnect explicito o expira el TTL),
            // se limpia el hash. Asi el contador de "Bogota: 12" baja
            // cuando se va gente, no solo sube.
            $cacheGeoKey = self::KEY_GEO_CACHE . $ip;
            $ciudadCache = Redis::get($cacheGeoKey);
            if (! $ciudadCache) {
                $datos = $geo->resolverPorIp($ip);
                $ciudadCache = ($datos && $datos['ciudad']) ? $datos['ciudad'] : '';
                Redis::setex($cacheGeoKey, self::TTL_GEO_CACHE, $ciudadCache);
            }
            if ($ciudadCache !== '') {
                Redis::hset(self::KEY_IP_CIUDAD, $ip, $ciudadCache);
                Redis::expire(self::KEY_IP_CIUDAD, self::TTL_PRESENCIA * 4);
                $this->limpiarIpsFantasma();
            }

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
     * Llamado por sendBeacon cuando el visitante cierra la pestaña o pasa
     * a background. Elimina la IP del set para que el conteo de "Personas
     * conectadas" baje al instante, sin esperar al TTL.
     */
    public function disconnect(Request $request): Response
    {
        $ip = $request->ip();
        if (! $ip) return response()->noContent();

        try {
            Redis::zrem(self::KEY_ONLINE, $ip);
            Redis::hdel(self::KEY_IP_CIUDAD, $ip);
            $this->publicarPresenciaSiToca();
        } catch (\Throwable $e) {
            Log::debug('Heartbeat disconnect — Redis no disponible', ['msg' => $e->getMessage()]);
        }

        return response()->noContent();
    }

    /**
     * Limpia del hash IPs que ya no estan en el sorted set de presencia
     * (porque expiraron sin disconnect explicito — ej. crash del navegador).
     * Best-effort: corre en cada heartbeat sin ser caro porque el hash es chico.
     */
    private function limpiarIpsFantasma(): void
    {
        $ipsHash    = array_keys(Redis::hgetall(self::KEY_IP_CIUDAD) ?: []);
        if (empty($ipsHash)) return;

        $ipsActivas = Redis::zrangebyscore(self::KEY_ONLINE, time() - self::TTL_PRESENCIA, '+inf') ?: [];
        $fantasmas  = array_diff($ipsHash, $ipsActivas);

        if (! empty($fantasmas)) {
            Redis::hdel(self::KEY_IP_CIUDAD, ...$fantasmas);
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

        // Ciudades de IPs CONECTADAS AHORA — agrupamos las ciudades del hash
        // tomando solo IPs que estan en el sorted set vivo (filtra fantasmas).
        $ipsActivas = Redis::zrangebyscore(self::KEY_ONLINE, time() - self::TTL_PRESENCIA, '+inf') ?: [];
        $ciudadesPorIp = $ipsActivas
            ? (Redis::hmget(self::KEY_IP_CIUDAD, $ipsActivas) ?: [])
            : [];
        $counts = [];
        foreach ($ciudadesPorIp as $ciudad) {
            if (! $ciudad) continue;
            $counts[$ciudad] = ($counts[$ciudad] ?? 0) + 1;
        }
        $items = [];
        foreach ($counts as $ciudad => $count) {
            $items[] = ['ciudad' => $ciudad, 'count' => $count];
        }
        usort($items, fn ($a, $b) => $b['count'] <=> $a['count']);
        $ciudades = array_slice($items, 0, 10);

        try {
            $ably = new \Ably\AblyRest(config('broadcasting.connections.ably.key'));
            $ably->channels->get('admin-orders')->publish('presencia.actualizada', [
                'online'   => $online,
                'ciudades' => $ciudades,
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
}
