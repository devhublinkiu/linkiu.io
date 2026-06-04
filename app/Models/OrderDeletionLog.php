<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Registro inmutable de cada operación de eliminación de órdenes. No tiene
 * método update — si necesitas corregir un dato, escribe otro registro.
 */
class OrderDeletionLog extends Model
{
    protected $fillable = [
        'codigos',
        'motivo',
        'total_eliminado_cop',
        'eliminado_por',
        'eliminado_at',
    ];

    protected $casts = [
        'codigos'             => 'array',
        'total_eliminado_cop' => 'integer',
        'eliminado_at'        => 'datetime',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'eliminado_por');
    }
}
