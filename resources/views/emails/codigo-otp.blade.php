@extends('emails.layouts.base')

@section('contenido')
    <h1 style="font-size:22px;font-weight:700;color:#0F172B;margin:0 0 12px 0;line-height:1.3;">
        Tu código de verificación
    </h1>
    <p style="font-size:16px;color:#45556C;line-height:1.6;margin:0 0 28px 0;">
        Hola, {{ $nombre }}. Usa el siguiente código para restablecer tu contraseña.
    </p>
    <div style="background-color:#F1F5F9;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px 0;">
        <p style="font-size:40px;font-weight:800;color:#0F172B;letter-spacing:10px;margin:0;font-family:monospace;">
            {{ $codigo }}
        </p>
        <p style="font-size:13px;color:#90A1B9;margin:8px 0 0 0;text-align:center;">
            Expira en 10 minutos
        </p>
    </div>
    <p style="font-size:13px;color:#90A1B9;line-height:1.6;margin:0;">
        Si no solicitaste este código, alguien puede estar intentando acceder a tu cuenta.
        Escríbenos por nuestra
        <a href="https://wa.me/573104594344" style="color:#45556C;">línea de WhatsApp</a>.
    </p>
@endsection
