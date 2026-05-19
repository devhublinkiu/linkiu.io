<?php

namespace App\Actions\Auth;

use App\Mail\BienvenidoEquipoMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class ActivateInvitation
{
    public function execute(string $token, string $password): array
    {
        $datos = cache()->get("invitation_{$token}");

        if (! $datos) {
            return ['error' => 'token_invalido'];
        }

        $usuario = User::find($datos['user_id']);

        if (! $usuario) {
            return ['error' => 'usuario_no_encontrado'];
        }

        $usuario->password          = $password;
        $usuario->email_verified_at = now();
        $usuario->save();

        cache()->forget("invitation_{$token}");

        Mail::mailer('resend_accounts')
            ->to($usuario->email)
            ->send(new BienvenidoEquipoMail($usuario));

        return ['ok' => true];
    }
}
