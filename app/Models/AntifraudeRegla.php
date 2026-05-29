<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AntifraudeRegla extends Model
{
    protected $table = 'antifraude_reglas';

    protected $fillable = [
        'clave',
        'activa',
        'parametros',
    ];

    protected $casts = [
        'activa'     => 'boolean',
        'parametros' => 'array',
    ];

    /**
     * Devuelve `[clave => regla]` con todas las reglas, indexado.
     * Útil para que el AntifraudeService las recorra sin múltiples queries.
     */
    public static function todasIndexadas(): \Illuminate\Support\Collection
    {
        return static::all()->keyBy('clave');
    }
}
