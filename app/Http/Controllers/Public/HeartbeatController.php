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
    private const KEY_CIUDADES   = 'vivo:ciudades';
    private const KEY_PUBLISH_LOCK = 'vivo:publish-lock';
    private const TTL_PRESENCIA  = 60;    // 1min — si no hay heartbeat en este tiempo, sale del set
    private const TTL_CIUDADES   = 14400; // 4h — la lista de ciudades del dia se mantiene
    private const DEBOUNCE_PUBLISH = 5;   // seg — minimo entre publishes de presencia a Ably

    private const BOT_PATTERNS = [
        'bot', 'crawl', 'spider', 'slurp', 'mediapartners', 'adsbot',
        'headlesschrome', 'phantomjs', 'puppeteer', 'playwright',
        'curl', 'wget', 'python-requests', 'go-http-client',
    ];

    public function __invoke(Request $request, GeoService $geo): Response
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

            // Geo solo en el primer heartbeat por IP (despues lo dedupeamos via Redis SET).
            $cacheGeoKey = "vivo:geo-counted:{$ip}";
            if (! Redis::get($cacheGeoKey)) {
                $datos = $geo->resolverPorIp($ip);
                if ($datos && $datos['ciudad']) {
                    Redis::hincrby(self::KEY_CIUDADES, $datos['ciudad'], 1);
                    Redis::expire(self::KEY_CIUDADES, self::TTL_CIUDADES);
                }
                Redis::setex($cacheGeoKey, self::TTL_CIUDADES, '1');
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
     * Si pasaron >=5s desde el ultimo publish, calcula presencia + ciudades
     * y publica a Ably. Se llama desde cada heartbeat pero solo "pega" cada 5s.
     */
    private function publicarPresenciaSiToca(): void
    {
        $adquirido = Redis::set(self::KEY_PUBLISH_LOCK, '1', 'EX', self::DEBOUNCE_PUBLISH, 'NX');
        if (! $adquirido) return;

        $online = (int) Redis::zcount(self::KEY_ONLINE, time() - self::TTL_PRESENCIA, '+inf');

        $hash = Redis::hgetall(self::KEY_CIUDADES) ?: [];
        $items = [];
        foreach ($hash as $ciudad => $count) {
            $items[] = ['ciudad' => $ciudad, 'count' => (int) $count];
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
