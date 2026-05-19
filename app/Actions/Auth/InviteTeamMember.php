<?php

namespace App\Actions\Auth;

use App\Mail\InvitacionUsuarioMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InviteTeamMember
{
    public function execute(string $nombre, string $email, string $rolSpatie): array
    {
        if (User::where('email', $email)->exists()) {
            return ['error' => 'email_en_uso'];
        }

        $token = Str::random(64);

        $usuario = User::create([
            'name'     => $nombre,
            'email'    => $email,
            'password' => Str::random(32), // temporal, se reemplaza al activar
            'role'     => 'admin',
        ]);

        $usuario->assignRole($rolSpatie);

        // Guardamos token de invitación en caché por 48 horas
        cache()->put("invitation_{$token}", [
            'user_id' => $usuario->id,
            'email'   => $email,
        ], now()->addHours(48));

        Mail::mailer('resend_accounts')
            ->to($email)
            ->send(new InvitacionUsuarioMail($usuario, $token));

        return ['ok' => true, 'usuario' => $usuario];
    }
}
