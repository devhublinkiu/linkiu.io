<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClienteBlacklist extends Model
{
    protected $table = 'clientes_blacklist';

    protected $fillable = [
        'tipo',
        'valor',
        'motivo',
        'created_by',
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }
}
