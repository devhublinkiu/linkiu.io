<?php

namespace App\Actions\Auth;

use App\Mail\CodigoOTPMail;
use App\Models\User;
use App\Services\WhatsappService;
use Illuminate\Support\Facades\Mail;

class SendOTP
{
    public function __construct(private WhatsappService $whatsapp) {}

    public function execute(User $usuario, string $metodo, string $codigo): bool
    {
        if ($metodo === 'whatsapp') {
            if (! $usuario->phone) {
                return false;
            }

            return $this->whatsapp->enviarOTP($usuario->phone, $codigo);
        }

        // Por correo
        Mail::mailer('resend_accounts')
            ->to($usuario->email)
            ->send(new CodigoOTPMail($usuario, $codigo));

        return true;
    }
}
