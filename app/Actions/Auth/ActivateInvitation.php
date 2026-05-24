<?php

namespace App\Actions\Auth;

use App\Mail\BienvenidoEquipoMail;
use App\Models\UserInvitation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ActivateInvitation
{
    /**
     * Activa una cuenta admin desde su token de invitación.
     *
     * Validaciones de seguridad:
     *  1. El token existe en `user_invitations`
     *  2. NO está expirado (>48h)
     *  3. NO fue consumido antes (replay prevention)
     *  4. El email actual del usuario sigue coincidiendo con el del
     *     snapshot al invitar (si un admin cambió el email después, el
     *     token queda inválido — evita account takeover si admin
     *     cambia email para apuntar a atacante)
     */
    public function execute(string $token, string $password): array
    {
        $invitacion = UserInvitation::where('token', $token)->first();

        if (! $invitacion || ! $invitacion->valida()) {
            return ['error' => 'token_invalido'];
        }

        $usuario = $invitacion->user;

        if (! $usuario) {
            return ['error' => 'usuario_no_encontrado'];
        }

        // Defense: el email del usuario debe coincidir con el snapshot
        // al momento de invitar. Si cambió, invalidar este token.
        if ($usuario->email !== $invitacion->email) {
            return ['error' => 'token_invalido'];
        }

        DB::transaction(function () use ($usuario, $invitacion, $password) {
            $usuario->password          = $password;
            $usuario->email_verified_at = now();
            $usuario->save();

            $invitacion->update(['consumed_at' => now()]);
        });

        try {
            Mail::mailer('resend_accounts')
                ->to($usuario->email)
                ->send(new BienvenidoEquipoMail($usuario));
        } catch (\Exception $e) {
            // Falla silenciosa — la cuenta ya está activa. El usuario
            // puede loguearse aunque el correo de bienvenida no llegue.
            Log::warning('ActivateInvitation: no se pudo enviar BienvenidoEquipoMail', [
                'user_id' => $usuario->id,
                'error'   => $e->getMessage(),
            ]);
        }

        return ['ok' => true];
    }
}
