<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Registro inmutable de cada reset de datos de Funelinks. No tiene método
 * update — si necesitas corregir un dato, escribe otro registro.
 */
class FunelinksResetLog extends Model
{
    protected $fillable = [
        'rango_desde',
        'rango_hasta',
        'producto_id',
        'borrado_sesiones',
        'borrado_visitas',
        'borrado_fomo',
        'conteo_sesiones',
        'conteo_visitas',
        'conteo_fomo',
        'motivo',
        'ejecutado_por',
        'ejecutado_at',
    ];

    protected $casts = [
        'rango_desde'      => 'date',
        'rango_hasta'      => 'date',
        'borrado_sesiones' => 'boolean',
        'borrado_visitas'  => 'boolean',
        'borrado_fomo'     => 'boolean',
        'conteo_sesiones'  => 'integer',
        'conteo_visitas'   => 'integer',
        'conteo_fomo'      => 'integer',
        'ejecutado_at'     => 'datetime',
    ];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ejecutado_por');
    }
}
