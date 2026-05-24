<?php

namespace App\Models;

use App\Support\Producto\SnapshotsRepository;
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

    protected static function booted(): void
    {
        // Cualquier order_item creado/borrado afecta ventas_7d/ventas_total
        // de un producto y por extensión el contexto (p75) del catálogo —
        // invalida snapshots de performance admin.
        $invalidar = fn () => SnapshotsRepository::invalidar();
        static::created($invalidar);
        static::deleted($invalidar);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
