<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class VariableItem extends Model
{
    protected $table = 'variable_items';

    protected $fillable = [
        'grupo_id',
        'nombre',
        'valor',
        'precio_ajuste',
        'activo',
        'orden',
    ];

    protected $casts = [
        'activo'         => 'boolean',
        'precio_ajuste'  => 'float',
    ];

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(VariableGrupo::class, 'grupo_id');
    }

    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->valor ? Storage::disk('s3')->url($this->valor) : null,
        );
    }
}
