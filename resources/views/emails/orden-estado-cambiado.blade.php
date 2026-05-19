@extends('emails.layouts.base')

@php
$etiquetas = [
    'confirmado' => ['titulo' => '¡Tu pedido fue confirmado!',      'color' => '#0F172B', 'mensaje' => 'Hemos confirmado tu pedido y pronto comenzaremos a prepararlo.'],
    'preparando' => ['titulo' => 'Estamos preparando tu pedido',    'color' => '#0F172B', 'mensaje' => 'Tu pedido está siendo alistado con mucho cuidado.'],
    'enviado'    => ['titulo' => 'Tu pedido va en camino',          'color' => '#0F172B', 'mensaje' => 'Tu pedido fue despachado y está en camino hacia ti.'],
    'entregado'  => ['titulo' => '¡Tu pedido fue entregado!',       'color' => '#0F172B', 'mensaje' => 'Tu pedido llegó a su destino. ¡Esperamos que lo disfrutes!'],
    'cancelado'  => ['titulo' => 'Tu pedido fue cancelado',         'color' => '#0F172B', 'mensaje' => 'Tu pedido ha sido cancelado. Si tienes alguna duda, escríbenos.'],
];
$info = $etiquetas[$orden->estado] ?? ['titulo' => 'Actualización de tu pedido', 'color' => '#0F172B', 'mensaje' => ''];
@endphp

@section('contenido')
    <h1 style="font-size:22px;font-weight:700;color:{{ $info['color'] }};margin:0 0 8px 0;line-height:1.3;">
        {{ $info['titulo'] }}
    </h1>
    <p style="font-size:14px;color:#45556C;margin:0 0 4px 0;">
        Hola {{ $orden->nombre }}, pedido <strong style="color:#0F172B;">{{ $orden->codigo }}</strong>
    </p>
    <p style="font-size:16px;color:#45556C;line-height:1.6;margin:0 0 28px 0;">
        {{ $info['mensaje'] }}
    </p>

    @if ($orden->estado === 'enviado' && $orden->numero_guia)
    <div style="background-color:#F1F5F9;border-radius:12px;padding:20px 24px;margin:0 0 28px 0;">
        <p style="font-size:13px;color:#90A1B9;margin:0 0 4px 0;">Número de guía</p>
        <p style="font-size:22px;font-weight:800;color:#0F172B;letter-spacing:4px;margin:0;font-family:monospace;">
            {{ $orden->numero_guia }}
        </p>
        @if ($orden->transportadora)
        <p style="font-size:13px;color:#90A1B9;margin:8px 0 0 0;">
            Transportadora: <strong style="color:#45556C;">{{ $orden->transportadora }}</strong>
        </p>
        @else
        <p style="font-size:13px;color:#90A1B9;margin:8px 0 0 0;">
            Usa este número para rastrear tu envío con la transportadora.
        </p>
        @endif
    </div>
    @endif

    <a href="{{ $urlSeguimiento }}"
       style="background-color:#45556C;color:#FFFFFF;border-radius:8px;padding:12px 28px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;margin-bottom:24px;">
        Ver estado de mi pedido
    </a>

    <p style="font-size:13px;color:#90A1B9;line-height:1.6;margin:0;">
        Si tienes preguntas, escríbenos por nuestra
        <a href="https://wa.me/573104594344" style="color:#45556C;">línea de WhatsApp</a>.
    </p>
@endsection
