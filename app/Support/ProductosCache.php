<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * Cache helper para queries públicas de productos.
 *
 * Usa version pattern (portable a cualquier cache driver — file, database,
 * redis, memcached) en vez de Cache::tags, que solo soporta redis/memcached.
 *
 * Al invalidar, la versión se reemplaza por un timestamp nuevo. Los snapshots
 * con versión vieja se quedan hasta TTL natural pero ya nadie los lee.
 */
class ProductosCache
{
    private const VERSION_KEY = 'productos:cache:version';
    private const TTL_SEGUNDOS = 60;

    public static function listado(callable $fn): mixed
    {
        return Cache::remember(self::key('listado'), self::TTL_SEGUNDOS, $fn);
    }

    public static function detalle(string $slug, callable $fn): mixed
    {
        return Cache::remember(self::key("detalle:{$slug}"), self::TTL_SEGUNDOS, $fn);
    }

    public static function categoria(string $slug, callable $fn): mixed
    {
        return Cache::remember(self::key("categoria:{$slug}"), self::TTL_SEGUNDOS, $fn);
    }

    /**
     * Invalida todos los caches de productos al pisar la versión.
     * Los snapshots viejos quedan huérfanos hasta su TTL.
     */
    public static function invalidar(): void
    {
        Cache::forever(self::VERSION_KEY, (string) microtime(true));
    }

    private static function key(string $suffix): string
    {
        $version = Cache::rememberForever(self::VERSION_KEY, fn () => (string) microtime(true));
        return "productos:{$suffix}:v{$version}";
    }
}
