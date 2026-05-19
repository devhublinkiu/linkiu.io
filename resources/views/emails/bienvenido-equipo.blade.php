@extends('emails.layouts.base')

@section('contenido')
    <h1 style="font-size:22px;font-weight:700;color:#0F172B;margin:0 0 12px 0;line-height:1.3;">
        ¡Bienvenido al equipo, {{ $nombre }}!
    </h1>
    <p style="font-size:16px;color:#45556C;line-height:1.6;margin:0 0 28px 0;">
        Tu cuenta en Linkiu ha sido activada exitosamente. Ya puedes acceder al panel de administración
        y comenzar a trabajar.
    </p>
    <a href="{{ $urlDashboard }}"
       style="background-color:#45556C;color:#FFFFFF;border-radius:8px;padding:12px 28px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">
        Ir al panel de administración
    </a>
    <p style="font-size:13px;color:#90A1B9;line-height:1.6;margin:28px 0 0 0;">
        Si tienes preguntas, escríbenos por nuestra
        <a href="https://wa.me/573104594344" style="color:#45556C;">línea de WhatsApp</a>.
    </p>
@endsection
