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
        return new Envelope(
            from: new Address(
                config('mail.orders_from', config('mail.from.address')),
                config('mail.orders_name', config('mail.from.name')),
            ),
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
