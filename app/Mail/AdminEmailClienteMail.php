<?php

namespace App\Mail;

use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminEmailClienteMail extends Mailable
{
    use Queueable, SerializesModels;

    public $mailer = 'resend_notifications';

    public function __construct(
        public Client $cliente,
        public string $asunto,
        public string $mensaje,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                config('mail.orders_from', config('mail.from.address')),
                config('mail.orders_name', config('mail.from.name')),
            ),
            subject: $this->asunto,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-email-cliente',
            with: [
                'cliente' => $this->cliente,
                'mensaje' => $this->mensaje,
            ],
        );
    }
}
