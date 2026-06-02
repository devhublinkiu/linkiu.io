<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * Cache helper para las props del navbar/mega-menu que se comparten en
 * CADA request via HandleInertiaRequests (nav_productos, nav_categorias,
 * BuildAnnouncement::activos).
 *
 * Sin esto, cada request hace queries con eager loading repetidas — incluso
 * en paginas que no usan el navbar (Login, etc.) los closures `fn () =>`
 * de Inertia 2 se evaluan eager.
 *
 * Usa version pattern (portable a cualquier cache driver — file, database,
 * redis, memcached). Al invalidar, la version se reemplaza por un timestamp
 * nuevo y los snapshots viejos quedan huerfanos hasta su TTL natural.
 *
 * Mismo patron que ProductosCache.
 */
class MenuCache
{
    private const VERSION_KEY = 'menu:cache:version';
    private const TTL_SEGUNDOS = 300;  // 5 min

    public static function productos(callable $fn): mixed
    {
        return Cache::remember(self::key('productos'), self::TTL_SEGUNDOS, $fn);
    }

    public static function categorias(callable $fn): mixed
    {
        return Cache::remember(self::key('categorias'), self::TTL_SEGUNDOS, $fn);
    }

    public static function anuncios(callable $fn): mixed
    {
        return Cache::remember(self::key('anuncios'), self::TTL_SEGUNDOS, $fn);
    }

    /**
     * Invalida todos los caches del menu al pisar la version.
     * Llamado desde los observers (Producto, Category, BuildAnnouncement).
     */
    public static function invalidar(): void
    {
        Cache::forever(self::VERSION_KEY, (string) microtime(true));
    }

    private static function key(string $suffix): string
    {
        $version = Cache::rememberForever(self::VERSION_KEY, fn () => (string) microtime(true));
        return "menu:{$suffix}:v{$version}";
    }
}
