<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientAddress extends Model
{
    protected $fillable = [
        'client_id',
        'etiqueta',
        'nombre',
        'telefono',
        'departamento',
        'ciudad',
        'direccion',
        'apartamento',
        'predeterminada',
    ];

    protected $casts = [
        'predeterminada' => 'boolean',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
