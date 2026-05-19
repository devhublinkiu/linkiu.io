<?php

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RequestPasswordReset
{
    const EXPIRACION_MINUTOS = 10;

    public function execute(string $email): ?array
    {
        $usuario = User::where('email', $email)->where('role', 'admin')->first();

        if (! $usuario) {
            // Retornamos null silenciosamente — no revelar si el correo existe
            return null;
        }

        $codigo = (string) random_int(100000, 999999);
        $token  = Str::random(64);

        // Guardamos hash del código junto al token y metadata en password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token'      => Hash::make($codigo),
                'created_at' => now(),
            ]
        );

        // Guardamos token de sesión en caché para el flujo multi-paso
        cache()->put("otp_token_{$email}", $token, now()->addMinutes(self::EXPIRACION_MINUTOS));
        cache()->put("otp_phone_{$email}", $usuario->phone, now()->addMinutes(self::EXPIRACION_MINUTOS));

        return [
            'codigo'  => $codigo,
            'token'   => $token,
            'usuario' => $usuario,
        ];
    }
}
