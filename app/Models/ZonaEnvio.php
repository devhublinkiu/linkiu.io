<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZonaEnvio extends Model
{
    protected $table    = 'zonas_envio';
    protected $fillable = ['nombre', 'departamentos', 'tipo_costo', 'costo', 'umbral_gratis', 'activo', 'orden'];

    protected $casts = [
        'departamentos' => 'array',
        'activo'        => 'boolean',
        'costo'         => 'integer',
        'umbral_gratis' => 'integer',
    ];
}
