<?php

namespace App\Mail;

use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CodigoOTPClienteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Client $cliente,
        public string $codigo
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address('no-reply@accounts.linkiu.bio', 'Linkiu'),
            subject: "Tu código de verificación: {$this->codigo}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.codigo-otp',
            with: [
                'nombre' => $this->cliente->nombre,
                'codigo' => $this->codigo,
            ],
        );
    }
}
