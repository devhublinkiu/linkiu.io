<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitacionUsuarioMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $usuario,
        public string $token
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address('invitaciones@accounts.linkiu.bio', 'Linkiu'),
            subject: 'Te han invitado a Linkiu',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invitacion-usuario',
            with: [
                'nombre'          => $this->usuario->name,
                'urlInvitacion'   => route('admin.invitation', $this->token),
            ],
        );
    }
}
