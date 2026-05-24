<?php

namespace App\Actions\Usuarios;

use App\Jobs\EnviarInvitacionUsuarioJob;
use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReenviarInvitacionUsuario
{
    /**
     * Reenvía la invitación a un usuario admin que aún no verificó su
     * correo. Invalida invitaciones previas no consumidas (expira al
     * pasado) y genera un token nuevo. El correo se manda async vía Job.
     */
    public function execute(User $usuario): array
    {
        if (! is_null($usuario->email_verified_at)) {
            return ['error' => 'ya_verificado'];
        }

        $token = Str::random(64);

        DB::transaction(function () use ($usuario, $token) {
            // Invalidar invitaciones previas no consumidas — defense para que
            // un token viejo (si filtró) no se pueda usar después.
            UserInvitation::where('user_id', $usuario->id)
                ->whereNull('consumed_at')
                ->update(['expires_at' => now()->subSecond()]);

            UserInvitation::create([
                'token'      => $token,
                'user_id'    => $usuario->id,
                'email'      => $usuario->email,
                'expires_at' => now()->addHours(48),
            ]);
        });

        EnviarInvitacionUsuarioJob::dispatch($usuario, $token);

        return ['ok' => true];
    }
}
