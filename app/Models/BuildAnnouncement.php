<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class BuildAnnouncement extends Model
{
    public const CACHE_ACTIVOS = 'build:anuncios:activos';

    protected $fillable = ['texto', 'emoji', 'btn_texto', 'btn_link', 'fin_timer', 'activo', 'orden'];

    protected $casts = [
        'fin_timer' => 'datetime',
        'activo'    => 'boolean',
    ];

    /**
     * Anuncios visibles en la tienda (activos y no expirados), cacheados 60s
     * para amortiguar pageloads y aún así dejar caer los expirados con timer.
     *
     * Cacheamos SOLO los IDs (array de ints) — no la Collection entera. Cachear
     * objetos Eloquent provoca __PHP_Incomplete_Class en deserialización entre
     * versiones de Laravel / PHP cuando properties internas cambian. Con IDs
     * primitivos el cache es inmune a esos cambios.
     */
    public static function activos(): Collection
    {
        $ids = Cache::remember(
            self::CACHE_ACTIVOS,
            now()->addSeconds(60),
            fn () => static::where('activo', true)
                ->where(fn ($q) => $q->whereNull('fin_timer')->orWhere('fin_timer', '>', now()))
                ->orderBy('orden')
                ->pluck('id')
                ->all(),
        );

        if (empty($ids)) {
            return new Collection();
        }

        // Re-fetcheamos preservando el orden de los IDs (orden definido por orderBy('orden') arriba).
        return static::whereIn('id', $ids)
            ->get()
            ->sortBy(fn (self $a) => array_search($a->id, $ids, true))
            ->values();
    }

    /**
     * Invalida el cache de anuncios activos al crear/actualizar/eliminar uno.
     */
    protected static function booted(): void
    {
        $invalidar = fn () => Cache::forget(self::CACHE_ACTIVOS);

        static::created($invalidar);
        static::updated($invalidar);
        static::deleted($invalidar);
    }
}
