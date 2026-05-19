@extends('emails.layouts.base')

@section('contenido')
    <h1 style="font-size:22px;font-weight:700;color:#0F172B;margin:0 0 16px 0;line-height:1.3;">
        Hola {{ $cliente->nombre }},
    </h1>
    <div style="font-size:15px;color:#45556C;line-height:1.7;white-space:pre-line;">
        {{ $mensaje }}
    </div>
@endsection
