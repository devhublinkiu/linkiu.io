<?php

namespace App\Jobs;

use App\Mail\InvitacionUsuarioMail;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Envía el correo de invitación a un usuario admin recién creado o re-
 * invitado. Async para que el create/reenviar response no espere a
 * Resend (~1-3s).
 *
 * Sin retries automáticos: si Resend falla, el admin puede usar el
 * botón "Reenviar invitación" del listado para intentar de nuevo.
 */
class EnviarInvitacionUsuarioJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public function __construct(
        public User $usuario,
        public string $token,
    ) {}

    public function handle(): void
    {
        try {
            Mail::mailer('resend_accounts')
                ->to($this->usuario->email)
                ->send(new InvitacionUsuarioMail($this->usuario, $this->token));
        } catch (\Exception $e) {
            Log::error('EnviarInvitacionUsuarioJob: ' . $e->getMessage(), [
                'user_id' => $this->usuario->id,
            ]);
        }
    }
}
