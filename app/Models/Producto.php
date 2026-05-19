<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Producto extends Model
{
    protected $fillable = [
        'nombre',
        'unidad',
        'slug',
        'descripcion',
        'category_id',
        'sku',
        'status',
        'precio_base',
        'precio_comparacion',
        'aplica_iva',
        'iva_porcentaje',
        'layout_orden',
    ];

    protected $casts = [
        'aplica_iva'          => 'boolean',
        'precio_base'         => 'float',
        'precio_comparacion'  => 'float',
        'iva_porcentaje'      => 'float',
        'layout_orden'        => 'array',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function cantidades(): HasMany
    {
        return $this->hasMany(ProductoCantidad::class)->orderBy('orden');
    }

    public function imagenes(): HasMany
    {
        return $this->hasMany(ProductoImagen::class)->orderBy('orden');
    }

    public function imagenPrincipal(): HasOne
    {
        return $this->hasOne(ProductoImagen::class)->where('principal', true);
    }

    public function variableGrupos(): HasMany
    {
        return $this->hasMany(VariableGrupo::class)->orderBy('orden');
    }

    public function hooks(): HasMany
    {
        return $this->hasMany(ProductoHook::class)->orderBy('orden');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function vistas(): HasMany
    {
        return $this->hasMany(ProductView::class);
    }
}
