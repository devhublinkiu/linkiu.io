<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BienvenidoEquipoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $usuario) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address('no-reply@accounts.linkiu.bio', 'Linkiu'),
            subject: '¡Bienvenido al equipo de Linkiu!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.bienvenido-equipo',
            with: [
                'nombre'      => $this->usuario->name,
                'urlDashboard' => route('admin.dashboard'),
            ],
        );
    }
}
