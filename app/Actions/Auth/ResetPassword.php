<?php

namespace App\Actions\Auth;

use App\Mail\ContrasenaActualizadaMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class ResetPassword
{
    public function execute(string $email, string $tokenReset, string $nuevaPassword): array
    {
        $tokenGuardado = cache()->get("reset_token_{$email}");

        if (! $tokenGuardado || $tokenGuardado !== $tokenReset) {
            return ['error' => 'token_invalido'];
        }

        $usuario = User::where('email', $email)->where('role', 'admin')->first();

        if (! $usuario) {
            return ['error' => 'usuario_no_encontrado'];
        }

        $usuario->update([
            'password'       => $nuevaPassword, // cast 'hashed' lo encripta automáticamente
            'login_attempts' => 0,
            'blocked_until'  => null,
        ]);

        cache()->forget("reset_token_{$email}");

        try {
            Mail::mailer('resend_accounts')
                ->to($usuario->email)
                ->send(new ContrasenaActualizadaMail($usuario));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('ResetPassword: no se pudo enviar email de confirmación', [
                'email'  => $email,
                'error'  => $e->getMessage(),
            ]);
        }

        return ['ok' => true];
    }
}
