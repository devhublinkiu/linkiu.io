<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva solicitud de contacto</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">

                    <tr>
                        <td style="background:#1e293b;padding:24px 32px;">
                            <p style="margin:0;color:#94a3b8;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Nuevo mensaje</p>
                            <p style="margin:4px 0 0;color:#f8fafc;font-size:20px;font-weight:700;">Formulario de contacto</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:32px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                @php
                                    $labels = [
                                        'nombre'  => 'Nombre',
                                        'correo'  => 'Correo electrónico',
                                        'asunto'  => 'Asunto',
                                        'mensaje' => 'Mensaje',
                                        'celular' => 'Celular',
                                        'empresa' => 'Empresa',
                                    ];
                                @endphp
                                @foreach($datos as $key => $valor)
                                @if(!str_starts_with($key, '_'))
                                <tr>
                                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                                        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">
                                            {{ $labels[$key] ?? $key }}
                                        </p>
                                        <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.6;white-space:pre-wrap;">{{ $valor }}</p>
                                    </td>
                                </tr>
                                @endif
                                @endforeach
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:16px 32px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                            <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                                Este mensaje fue enviado desde el formulario de contacto de tu tienda.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
