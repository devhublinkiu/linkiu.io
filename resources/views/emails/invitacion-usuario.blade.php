@extends('emails.layouts.base')

@section('contenido')
    <h1 style="font-size:22px;font-weight:700;color:#0F172B;margin:0 0 12px 0;line-height:1.3;">
        Te han invitado a Linkiu
    </h1>
    <p style="font-size:16px;color:#45556C;line-height:1.6;margin:0 0 28px 0;">
        Hola, {{ $nombre }}. Has sido invitado a unirte al equipo de administración en Linkiu.
        Haz clic en el botón para activar tu cuenta y establecer tu contraseña.
    </p>
    <a href="{{ $urlInvitacion }}"
       style="background-color:#45556C;color:#FFFFFF;border-radius:8px;padding:12px 28px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">
        Activar mi cuenta
    </a>
    <p style="font-size:13px;color:#90A1B9;line-height:1.6;margin:28px 0 0 0;">
        Este enlace expira en 48 horas. Si no esperabas esta invitación, puedes ignorar este mensaje.
    </p>
@endsection
