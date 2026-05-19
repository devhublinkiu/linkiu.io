<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'username',
        'email',
        'phone',
        'gender',
        'birthdate',
        'country',
        'department',
        'city',
        'password',
        'role',
        'login_attempts',
        'blocked_until',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'blocked_until'     => 'datetime',
            'birthdate'         => 'date',
            'password'          => 'hashed',
        ];
    }

    public function esAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function estaBloqueado(): bool
    {
        return $this->blocked_until && $this->blocked_until->isFuture();
    }
}
