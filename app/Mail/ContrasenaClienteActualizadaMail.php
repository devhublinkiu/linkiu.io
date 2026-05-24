<?php

namespace App\Mail;

use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContrasenaClienteActualizadaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Client $cliente) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address('no-reply@accounts.linkiu.bio', 'Linkiu'),
            replyTo: [new \Illuminate\Mail\Mailables\Address('soporte@linkiu.bio', 'Soporte Linkiu')],
            subject: 'Tu contraseña ha sido actualizada — Linkiu',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contrasena-actualizada',
            with: ['nombre' => $this->cliente->nombre],
        );
    }
}
