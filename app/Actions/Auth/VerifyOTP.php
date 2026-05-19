<?php

namespace App\Actions\Auth;

use App\Mail\CuentaBloqueadaMail;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class VerifyOTP
{
    const INTENTOS_MAX    = 5;
    const MINUTOS_BLOQUEO = 15;

    public function execute(string $email, string $codigo): array
    {
        $registro = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (! $registro) {
            return ['error' => 'otp_invalido'];
        }

        // OTP expirado (10 minutos)
        if (Carbon::parse($registro->created_at)->addMinutes(10)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return ['error' => 'otp_expirado'];
        }

        if (! Hash::check($codigo, $registro->token)) {
            return $this->registrarIntentoFallido($email);
        }

        // OTP correcto — generamos token de reset y limpiamos
        $tokenReset = base64_encode($email . '|' . now()->timestamp);
        cache()->put("reset_token_{$email}", $tokenReset, now()->addMinutes(15));
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return ['ok' => true, 'token_reset' => $tokenReset];
    }

    private function registrarIntentoFallido(string $email): array
    {
        $clave    = "otp_intentos_{$email}";
        $intentos = (int) cache()->get($clave, 0) + 1;
        cache()->put($clave, $intentos, now()->addMinutes(15));

        if ($intentos >= self::INTENTOS_MAX) {
            $usuario = User::where('email', $email)->first();

            if ($usuario) {
                $bloqueadoHasta = Carbon::now()->addMinutes(self::MINUTOS_BLOQUEO);
                $usuario->update(['blocked_until' => $bloqueadoHasta]);

                try {
                    Mail::mailer('resend_accounts')
                        ->to($email)
                        ->send(new CuentaBloqueadaMail($usuario, $bloqueadoHasta));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('VerifyOTP: no se pudo enviar email de bloqueo', ['email' => $email]);
                }
            }

            cache()->forget($clave);

            return ['error' => 'cuenta_bloqueada', 'minutos' => self::MINUTOS_BLOQUEO];
        }

        return [
            'error'              => 'otp_invalido',
            'intentos_restantes' => self::INTENTOS_MAX - $intentos,
        ];
    }
}
