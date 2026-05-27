<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrdenEstadoCambiadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $mailer = 'resend_notifications';

    public function __construct(public Order $orden) {}

    public function envelope(): Envelope
    {
        $etiquetas = [
            'confirmado'  => 'Pedido confirmado',
            'preparando'  => 'Estamos preparando tu pedido',
            'enviado'     => 'Tu pedido va en camino',
            'entregado'   => '¡Pedido entregado!',
            'cancelado'   => 'Pedido cancelado',
        ];

        $asunto = $etiquetas[$this->orden->estado] ?? "Actualización de tu pedido #{$this->orden->codigo}";

        $fromAddress = config('mail.orders_from')
            ?? config('mail.from.address')
            ?? 'no-reply@linkiu.bio';
        $fromName    = config('mail.orders_name')
            ?? config('mail.from.name')
            ?? 'Linkiu';

        return new Envelope(
            from: new Address($fromAddress, $fromName),
            subject: "{$asunto} #{$this->orden->codigo}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orden-estado-cambiado',
            with: [
                'orden'          => $this->orden,
                'urlSeguimiento' => url("/orden/{$this->orden->acceso_token}"),
            ],
        );
    }
}
