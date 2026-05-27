<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrdenConfirmadaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $mailer = 'resend_notifications';

    public function __construct(public Order $orden) {}

    public function envelope(): Envelope
    {
        // Defaults seguros: si MAIL_FROM_ADDRESS no está en .env, evitamos
        // TypeError en Address::__construct (que NO es Exception sino Error
        // y rompía el job entero).
        $fromAddress = config('mail.orders_from')
            ?? config('mail.from.address')
            ?? 'no-reply@linkiu.bio';
        $fromName    = config('mail.orders_name')
            ?? config('mail.from.name')
            ?? 'Linkiu';

        return new Envelope(
            from: new Address($fromAddress, $fromName),
            subject: "Pedido recibido #{$this->orden->codigo}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orden-confirmada',
            with: [
                'orden'        => $this->orden->load('items'),
                'urlSeguimiento' => url("/orden/{$this->orden->acceso_token}"),
            ],
        );
    }
}
