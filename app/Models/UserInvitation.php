<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserInvitation extends Model
{
    protected $fillable = [
        'token',
        'user_id',
        'email',
        'expires_at',
        'consumed_at',
    ];

    protected $casts = [
        'expires_at'  => 'datetime',
        'consumed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function expirada(): bool
    {
        return $this->expires_at->isPast();
    }

    public function consumida(): bool
    {
        return $this->consumed_at !== null;
    }

    public function valida(): bool
    {
        return ! $this->expirada() && ! $this->consumida();
    }
}
