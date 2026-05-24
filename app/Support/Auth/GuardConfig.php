<?php

namespace App\Support\Auth;

use App\Mail\CodigoOTPClienteMail;
use App\Mail\CodigoOTPMail;
use App\Mail\ContrasenaActualizadaMail;
use App\Mail\ContrasenaClienteActualizadaMail;
use App\Mail\CuentaBloqueadaMail;
use App\Mail\CuentaClienteBloqueadaMail;
use App\Models\Client;
use App\Models\User;

/**
 * Resuelve el modelo, mailers y atributos específicos por guard para los
 * flujos compartidos de recuperación de contraseña / OTP entre admin y
 * cliente.
 *
 * Centralizar aquí evita ramificar cada Action con if/else por guard.
 */
class GuardConfig
{
    public function __construct(
        public string $guard,
        public string $userClass,
        public string $mailer,
        public string $codigoOtpMailClass,
        public string $contrasenaActualizadaMailClass,
        public string $cuentaBloqueadaMailClass,
        public string $phoneField,
        public string $nameField,
    ) {}

    public static function for(string $guard): self
    {
        return match ($guard) {
            'web' => new self(
                guard:                          'web',
                userClass:                      User::class,
                mailer:                         'resend_accounts',
                codigoOtpMailClass:             CodigoOTPMail::class,
                contrasenaActualizadaMailClass: ContrasenaActualizadaMail::class,
                cuentaBloqueadaMailClass:       CuentaBloqueadaMail::class,
                phoneField:                     'phone',
                nameField:                      'name',
            ),
            'client' => new self(
                guard:                          'client',
                userClass:                      Client::class,
                mailer:                         'resend_accounts',
                codigoOtpMailClass:             CodigoOTPClienteMail::class,
                contrasenaActualizadaMailClass: ContrasenaClienteActualizadaMail::class,
                cuentaBloqueadaMailClass:       CuentaClienteBloqueadaMail::class,
                phoneField:                     'telefono',
                nameField:                      'nombre',
            ),
            default => throw new \InvalidArgumentException("Guard no soportado: {$guard}"),
        };
    }

    /**
     * Busca el usuario por email aplicando filtros propios del guard
     * (ej. en 'web' filtra rol='admin').
     */
    public function findByEmail(string $email)
    {
        $query = ($this->userClass)::where('email', $email);

        if ($this->guard === 'web') {
            $query->where('role', 'admin');
        }

        return $query->first();
    }
}
