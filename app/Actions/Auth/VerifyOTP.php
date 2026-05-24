<?php

namespace App\Actions\Auth;

use App\Support\Auth\GuardConfig;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class VerifyOTP
{
    const INTENTOS_MAX    = 5;
    const MINUTOS_BLOQUEO = 15;

    public function execute(string $email, string $codigo, string $guard = 'web'): array
    {
        $registro = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->where('guard', $guard)
            ->first();

        if (! $registro) {
            return ['error' => 'otp_invalido'];
        }

        // OTP expirado (10 minutos)
        if (Carbon::parse($registro->created_at)->addMinutes(10)->isPast()) {
            DB::table('password_reset_tokens')
                ->where('email', $email)
                ->where('guard', $guard)
                ->delete();

            return ['error' => 'otp_expirado'];
        }

        if (! Hash::check($codigo, $registro->token)) {
            return $this->registrarIntentoFallido($email, $guard);
        }

        // OTP correcto — generamos token de reset y limpiamos
        $tokenReset = base64_encode($email . '|' . $guard . '|' . now()->timestamp);
        cache()->put("reset_token_{$guard}_{$email}", $tokenReset, now()->addMinutes(15));
        DB::table('password_reset_tokens')
            ->where('email', $email)
            ->where('guard', $guard)
            ->delete();

        return ['ok' => true, 'token_reset' => $tokenReset];
    }

    private function registrarIntentoFallido(string $email, string $guard): array
    {
        $clave    = "otp_intentos_{$guard}_{$email}";
        $intentos = (int) cache()->get($clave, 0) + 1;
        cache()->put($clave, $intentos, now()->addMinutes(15));

        if ($intentos >= self::INTENTOS_MAX) {
            $config  = GuardConfig::for($guard);
            $usuario = $config->findByEmail($email);

            if ($usuario) {
                $bloqueadoHasta = Carbon::now()->addMinutes(self::MINUTOS_BLOQUEO);

                // Solo guard 'web' (User) tiene columna blocked_until.
                // Para 'client' usamos cache flag.
                if ($guard === 'web') {
                    $usuario->update(['blocked_until' => $bloqueadoHasta]);
                } else {
                    cache()->put("client_blocked_{$email}", $bloqueadoHasta, $bloqueadoHasta);
                }

                try {
                    $mailable = new ($config->cuentaBloqueadaMailClass)($usuario, $bloqueadoHasta);
                    Mail::mailer($config->mailer)->to($email)->send($mailable);
                } catch (\Exception $e) {
                    Log::warning('VerifyOTP: no se pudo enviar email de bloqueo', [
                        'email' => $email,
                        'guard' => $guard,
                    ]);
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
