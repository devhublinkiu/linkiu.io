<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Integracion extends Model
{
    protected $table    = 'integraciones';
    protected $fillable = ['clave', 'valor'];

    public static function get(string $clave, ?string $default = null): ?string
    {
        return static::where('clave', $clave)->value('valor') ?? $default;
    }

    public static function set(string $clave, ?string $valor): void
    {
        static::updateOrCreate(['clave' => $clave], ['valor' => $valor]);
    }
}
