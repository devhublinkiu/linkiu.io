<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetodoPago extends Model
{
    protected $table    = 'metodos_pago';
    protected $fillable = ['clave', 'nombre', 'descripcion', 'activo', 'orden', 'config'];

    protected $casts = [
        'activo' => 'boolean',
        'config' => 'array',
    ];
}
