<?php

namespace App\Actions\Auth;

use App\Services\WhatsappService;
use App\Support\Auth\GuardConfig;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;

class SendOTP
{
    public function __construct(private WhatsappService $whatsapp) {}

    public function execute(Model $usuario, string $metodo, string $codigo, string $guard = 'web'): bool
    {
        $config = GuardConfig::for($guard);

        if ($metodo === 'whatsapp') {
            $telefono = $usuario->{$config->phoneField};

            if (! $telefono) {
                return false;
            }

            return $this->whatsapp->enviarOTP($telefono, $codigo);
        }

        // Por correo
        $mailable = new ($config->codigoOtpMailClass)($usuario, $codigo);

        Mail::mailer($config->mailer)
            ->to($usuario->email)
            ->send($mailable);

        return true;
    }
}
