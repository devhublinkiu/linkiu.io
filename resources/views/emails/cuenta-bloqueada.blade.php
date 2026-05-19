@extends('emails.layouts.base')

@section('contenido')
    <h1 style="font-size:22px;font-weight:700;color:#0F172B;margin:0 0 12px 0;line-height:1.3;">
        Cuenta bloqueada temporalmente
    </h1>
    <p style="font-size:16px;color:#45556C;line-height:1.6;margin:0 0 16px 0;">
        Hola, {{ $nombre }}. Tu cuenta ha sido bloqueada por múltiples intentos fallidos de acceso.
    </p>
    <p style="font-size:16px;color:#45556C;line-height:1.6;margin:0 0 28px 0;">
        Podrás intentar de nuevo a partir del <strong>{{ $bloqueadoHasta }}</strong>.
    </p>
    <a href="https://wa.me/573104594344"
       style="background-color:#45556C;color:#FFFFFF;border-radius:8px;padding:12px 28px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">
        Contactar soporte
    </a>
    <p style="font-size:13px;color:#90A1B9;line-height:1.6;margin:28px 0 0 0;">
        Si no fuiste tú quien intentó acceder, te recomendamos cambiar tu contraseña tan pronto como el bloqueo termine.
    </p>
@endsection
