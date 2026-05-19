<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'producto_id',
        'producto_nombre',
        'producto_imagen',
        'label',
        'cantidad',
        'precio_unitario',
    ];

    protected $casts = [
        'producto_id'     => 'integer',
        'cantidad'        => 'integer',
        'precio_unitario' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
