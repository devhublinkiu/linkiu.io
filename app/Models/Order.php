<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'codigo',
        'client_id',
        'estado',
        'metodo_pago',
        'subtotal',
        'costo_envio',
        'recargo',
        'total',
        'nombre',
        'apellido',
        'email',
        'telefono',
        'departamento',
        'ciudad',
        'direccion',
        'apartamento',
        'notas',
        'comprobante_path',
        'numero_guia',
        'transportadora',
        'notas_internas',
        'mp_payment_id',
        'mp_status',
        'mp_status_detail',
    ];

    protected $casts = [
        'subtotal'    => 'integer',
        'costo_envio' => 'integer',
        'recargo'     => 'integer',
        'total'       => 'integer',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
