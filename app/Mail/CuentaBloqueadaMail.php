<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class CuentaBloqueadaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $usuario,
        public Carbon $bloqueadoHasta
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address('no-reply@accounts.linkiu.bio', 'Linkiu'),
            replyTo: [new \Illuminate\Mail\Mailables\Address('soporte@linkiu.bio', 'Soporte Linkiu')],
            subject: 'Tu cuenta ha sido bloqueada temporalmente — Linkiu',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.cuenta-bloqueada',
            with: [
                'nombre'         => $this->usuario->name,
                'bloqueadoHasta' => $this->bloqueadoHasta->format('d/m/Y H:i'),
            ],
        );
    }
}
