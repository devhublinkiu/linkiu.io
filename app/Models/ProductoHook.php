<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductoHook extends Model
{
    protected $table = 'producto_hooks';

    protected $fillable = [
        'producto_id',
        'hook_key',
        'activo',
        'config',
        'orden',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'config' => 'array',
    ];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
