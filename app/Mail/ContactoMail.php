<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly array $datos,
    ) {}

    public function envelope(): Envelope
    {
        $asunto = $this->datos['asunto'] ?? 'Nueva solicitud de contacto';

        return new Envelope(subject: "Contacto: {$asunto}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.contacto');
    }
}
