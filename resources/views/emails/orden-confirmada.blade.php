@extends('emails.layouts.base')

@section('contenido')
    <h1 style="font-size:22px;font-weight:700;color:#0F172B;margin:0 0 12px 0;line-height:1.3;">
        ¡Recibimos tu pedido, {{ $orden->nombre }}!
    </h1>
    <p style="font-size:16px;color:#45556C;line-height:1.6;margin:0 0 4px 0;">
        Código: <strong style="color:#0F172B;">{{ $orden->codigo }}</strong>
    </p>
    <p style="font-size:14px;color:#90A1B9;margin:0 0 28px 0;">
        Te notificaremos cada vez que haya un cambio en tu pedido.
    </p>

    {{-- Items --}}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-collapse:collapse;">
        @foreach ($orden->items as $item)
        <tr>
            <td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:14px;color:#0F172B;">
                {{ $item->producto_nombre }}
                @if($item->label)
                    <span style="color:#90A1B9;font-size:12px;"> · {{ $item->label }}</span>
                @endif
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:14px;color:#45556C;text-align:center;width:40px;">
                x{{ $item->cantidad }}
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:14px;font-weight:600;color:#0F172B;text-align:right;">
                ${{ number_format($item->precio_unitario * $item->cantidad, 0, ',', '.') }}
            </td>
        </tr>
        @endforeach
    </table>

    {{-- Totales --}}
    @if ($orden->costo_envio > 0)
    <p style="font-size:13px;color:#45556C;margin:0 0 4px 0;text-align:right;">
        Subtotal: ${{ number_format($orden->subtotal, 0, ',', '.') }}
    </p>
    <p style="font-size:13px;color:#45556C;margin:0 0 4px 0;text-align:right;">
        Envío: ${{ number_format($orden->costo_envio, 0, ',', '.') }}
    </p>
    @endif
    @if ($orden->recargo > 0)
    <p style="font-size:13px;color:#D97706;margin:0 0 4px 0;text-align:right;">
        Recargo contraentrega: ${{ number_format($orden->recargo, 0, ',', '.') }}
    </p>
    @endif
    <p style="font-size:16px;font-weight:700;color:#0F172B;margin:8px 0 28px 0;text-align:right;">
        Total: ${{ number_format($orden->total, 0, ',', '.') }}
    </p>

    <p style="font-size:13px;color:#90A1B9;line-height:1.6;margin:0 0 24px 0;">
        Entrega en: {{ $orden->ciudad }}, {{ $orden->departamento }}<br>
        {{ $orden->direccion }}{{ $orden->apartamento ? ' · ' . $orden->apartamento : '' }}
    </p>

    <a href="{{ $urlSeguimiento }}"
       style="background-color:#45556C;color:#FFFFFF;border-radius:8px;padding:12px 28px;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;">
        Ver estado de mi pedido
    </a>
@endsection
