<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Client extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'nombre',
        'apellido',
        'email',
        'telefono',
        'password',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'password' => 'hashed',
    ];

    protected $appends = ['tiene_cuenta'];

    /**
     * Normaliza el email a minúsculas y sin espacios. Garantiza que login,
     * búsquedas y validaciones unique funcionen de forma consistente
     * independientemente de cómo lo escriba el cliente.
     */
    public function setEmailAttribute($value): void
    {
        $this->attributes['email'] = strtolower(trim((string) $value));
    }

    /**
     * Cliente "Con cuenta" tiene password; "Invitado" lo creó implícitamente
     * un checkout sin password. Se expone como atributo serializado para
     * que controllers, Inertia y exports lo lean de una sola fuente.
     */
    public function getTieneCuentaAttribute(): bool
    {
        return ! is_null($this->attributes['password'] ?? null);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public static function cacheKeyStats(int $clientId): string
    {
        return "client_stats_{$clientId}";
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(ClientAddress::class);
    }
}
