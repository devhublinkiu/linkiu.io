@extends('emails.layouts.base')

@section('contenido')
    <h1 style="font-size:22px;font-weight:700;color:#0F172B;margin:0 0 12px 0;line-height:1.3;">
        Tu contraseña fue actualizada
    </h1>
    <p style="font-size:16px;color:#45556C;line-height:1.6;margin:0 0 28px 0;">
        Hola, {{ $nombre }}. Tu contraseña en Linkiu ha sido cambiada exitosamente.
    </p>
    <p style="font-size:14px;color:#45556C;line-height:1.6;margin:0 0 28px 0;">
        Si no realizaste este cambio, contacta a nuestro equipo de soporte de inmediato.
    </p>
    <a href="https://wa.me/573104594344"
       style="background-color:#45556C;color:#FFFFFF;border-radius:8px;padding:12px 28px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">
        Contactar soporte
    </a>
@endsection
