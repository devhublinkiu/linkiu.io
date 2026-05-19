@extends('emails.layouts.base')

@section('contenido')
    <h1 style="font-size:22px;font-weight:700;color:#0F172B;margin:0 0 12px 0;line-height:1.3;">
        Verifica tu correo electrónico
    </h1>
    <p style="font-size:16px;color:#45556C;line-height:1.6;margin:0 0 28px 0;">
        Hola, {{ $nombre }}. Para activar tu cuenta en Linkiu haz clic en el botón a continuación.
    </p>
    <a href="{{ $urlVerificacion }}"
       style="background-color:#45556C;color:#FFFFFF;border-radius:8px;padding:12px 28px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">
        Verificar correo
    </a>
    <p style="font-size:13px;color:#90A1B9;line-height:1.6;margin:28px 0 0 0;">
        Este enlace expira en 48 horas. Si no creaste esta cuenta, puedes ignorar este mensaje.
    </p>
@endsection
