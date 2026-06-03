<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitanteSesion extends Model
{
    protected $table = 'visitante_sesiones';

    protected $fillable = [
        'visitante_hash',
        'pagina_entrada',
        'pagina_salida',
        'producto_id',
        'origen',
        'dispositivo',
        'ciudad',
        'pais',
        'recorrido',
        'seccion_final',
        'duracion_segundos',
        'inicio',
        'fin',
    ];

    protected $casts = [
        'recorrido' => 'array',
        'inicio'    => 'datetime',
        'fin'       => 'datetime',
    ];
}
