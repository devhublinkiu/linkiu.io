<?php

namespace App\Actions\Auth;

use App\Support\Auth\GuardConfig;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ResetPassword
{
    public function execute(string $email, string $tokenReset, string $nuevaPassword, string $guard = 'web'): array
    {
        $tokenGuardado = cache()->get("reset_token_{$guard}_{$email}");

        if (! $tokenGuardado || $tokenGuardado !== $tokenReset) {
            return ['error' => 'token_invalido'];
        }

        $config  = GuardConfig::for($guard);
        $usuario = $config->findByEmail($email);

        if (! $usuario) {
            return ['error' => 'usuario_no_encontrado'];
        }

        $cambios = ['password' => $nuevaPassword]; // cast 'hashed' encripta

        // Solo guard 'web' (User) tiene login_attempts/blocked_until
        if ($guard === 'web') {
            $cambios['login_attempts'] = 0;
            $cambios['blocked_until']  = null;
        }

        $usuario->update($cambios);

        cache()->forget("reset_token_{$guard}_{$email}");
        cache()->forget("client_blocked_{$email}");

        try {
            $mailable = new ($config->contrasenaActualizadaMailClass)($usuario);
            Mail::mailer($config->mailer)
                ->to($usuario->email)
                ->send($mailable);
        } catch (\Exception $e) {
            Log::warning('ResetPassword: no se pudo enviar email de confirmación', [
                'email' => $email,
                'guard' => $guard,
                'error' => $e->getMessage(),
            ]);
        }

        return ['ok' => true];
    }
}
