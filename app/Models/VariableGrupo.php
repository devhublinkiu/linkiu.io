<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VariableGrupo extends Model
{
    protected $table = 'variable_grupos';

    protected $fillable = [
        'producto_id',
        'nombre',
        'tipo',
        'orden',
    ];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(VariableItem::class, 'grupo_id')->orderBy('orden');
    }
}
