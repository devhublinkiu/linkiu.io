<?php

namespace App\Actions\Auth;

use App\Support\Auth\GuardConfig;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RequestPasswordReset
{
    const EXPIRACION_MINUTOS = 10;

    public function execute(string $email, string $guard = 'web'): ?array
    {
        $config  = GuardConfig::for($guard);
        $usuario = $config->findByEmail($email);

        if (! $usuario) {
            // Retornamos null silenciosamente — no revelar si el correo existe
            return null;
        }

        $codigo = (string) random_int(100000, 999999);
        $token  = Str::random(64);

        // password_reset_tokens tiene PK compuesta (email, guard) desde la
        // migración 2026_05_23_200000_add_guard_to_password_reset_tokens_table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email, 'guard' => $guard],
            [
                'token'      => Hash::make($codigo),
                'created_at' => now(),
            ]
        );

        cache()->put("otp_token_{$guard}_{$email}", $token, now()->addMinutes(self::EXPIRACION_MINUTOS));
        cache()->put("otp_phone_{$guard}_{$email}", $usuario->{$config->phoneField}, now()->addMinutes(self::EXPIRACION_MINUTOS));

        return [
            'codigo'  => $codigo,
            'token'   => $token,
            'usuario' => $usuario,
            'phone'   => $usuario->{$config->phoneField},
        ];
    }
}
