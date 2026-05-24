<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class BuildConfig extends Model
{
    protected $fillable = ['key', 'value'];

    private static function cacheKey(string $key): string
    {
        return "build_config:{$key}";
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        // Wrapper en array para distinguir "no cacheado" de "cacheado como null".
        // Sin esto, Cache::rememberForever recomputa cada vez si el valor es null.
        $envelope = Cache::rememberForever(
            self::cacheKey($key),
            fn () => ['v' => static::where('key', $key)->value('value')],
        );

        return $envelope['v'] ?? $default;
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget(self::cacheKey($key));
    }

    /**
     * Resuelve la ruta guardada en una key a URL pública del bucket S3.
     * Devuelve null si la key está vacía.
     */
    public static function asset(string $key): ?string
    {
        $ruta = static::get($key);

        if (! $ruta) {
            return null;
        }

        return Storage::disk('s3')->url($ruta);
    }
}
