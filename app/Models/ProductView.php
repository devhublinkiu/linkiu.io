<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductView extends Model
{
    protected $table = 'product_views';

    protected $fillable = [
        'producto_id',
        'fecha',
        'visitas',
        'scroll_depth_sum',
        'scroll_depth_count',
    ];

    protected $casts = [
        'fecha'               => 'date',
        'visitas'             => 'integer',
        'scroll_depth_sum'    => 'integer',
        'scroll_depth_count'  => 'integer',
    ];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
