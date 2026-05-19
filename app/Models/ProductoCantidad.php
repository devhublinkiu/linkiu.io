<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductoCantidad extends Model
{
    protected $table = 'producto_cantidades';

    protected $fillable = [
        'producto_id',
        'imagen',
        'cantidad',
        'precio_bundle',
        'badge_texto',
        'destacado',
        'orden',
    ];

    protected $casts = [
        'destacado' => 'boolean',
    ];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
