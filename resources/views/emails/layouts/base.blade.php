<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $titulo ?? 'Linkiu' }}</title>
</head>
<body style="background-color:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;margin:0;padding:32px 0;">

    <div style="max-width:600px;margin:0 auto;background-color:#FFFFFF;border-radius:8px;border:1px solid #E2E8F0;overflow:hidden;">

        {{-- Header --}}
        <div style="padding:20px 32px;border-bottom:1px solid #E2E8F0;text-align:center;">
            <a href="https://linkiu.bio">
                <img src="{{ env('LINKIU_ASSETS_URL') }}/assets/email_resources/logotipo_Linkiu.png"
                     alt="Linkiu" height="30" style="margin:0 auto;display:block;" />
            </a>
        </div>

        {{-- Contenido --}}
        <div style="padding:40px 32px;">
            @yield('contenido')
        </div>

        {{-- Footer --}}
        <div style="padding:28px 24px 24px;text-align:center;">

            <hr style="border:none;border-top:1px solid #E2E8F0;margin:20px 0;" />

            <p style="font-size:13px;color:#62748E;margin:0 0 14px 0;text-align:center;">
                ¿Ya nos sigues en redes? ¡Siempre tenemos cosas nuevas!
            </p>
            <div>
                <a href="https://www.facebook.com/linkiu.bio" style="display:inline-block;">
                    <img src="{{ env('LINKIU_ASSETS_URL') }}/assets/email_resources/icon_facebook.png" alt="Facebook" />
                </a>
                <a href="https://x.com/Linkiubio" style="display:inline-block;">
                    <img src="{{ env('LINKIU_ASSETS_URL') }}/assets/email_resources/icon_x.png" alt="X" />
                </a>
                <a href="https://www.linkedin.com/company/linkiu-bio" style="display:inline-block;">
                    <img src="{{ env('LINKIU_ASSETS_URL') }}/assets/email_resources/icon_linkeind.png" alt="LinkedIn" />
                </a>
                <a href="https://www.instagram.com/linkiu.bio/" style="display:inline-block;">
                    <img src="{{ env('LINKIU_ASSETS_URL') }}/assets/email_resources/icon_instagram.png" alt="Instagram" />
                </a>
                <a href="https://www.youtube.com/@Linkiubio" style="display:inline-block;">
                    <img src="{{ env('LINKIU_ASSETS_URL') }}/assets/email_resources/icon_youtube.png" alt="YouTube" />
                </a>
                <a href="https://wa.me/573104594344" style="display:inline-block;">
                    <img src="{{ env('LINKIU_ASSETS_URL') }}/assets/email_resources/icon_whatsapp.png" alt="WhatsApp" />
                </a>
            </div>

            <hr style="border:none;border-top:1px solid #E2E8F0;margin:20px 0;" />

            <p style="font-size:12px;color:#90A1B9;margin:0;text-align:center;line-height:1.8;">
                Powered by:<br>
                <span style="color:#62748E;font-weight:600;">Linkiu</span>
                <span style="color:#CBD5E2;margin:0 6px;">·</span>
                <span style="color:#62748E;">Linkiu.bio</span>
                <span style="color:#CBD5E2;margin:0 6px;">·</span>
                <span style="color:#62748E;">Linkiu.io</span>
            </p>

            <hr style="border:none;border-top:1px solid #E2E8F0;margin:20px 0;" />

            <p style="font-size:11px;color:#90A1B9;margin:0;text-align:center;line-height:1.7;">
                No respondas este mensaje. Esta dirección no acepta correos entrantes,
                por lo que no recibirás respuesta. Como parte de nuestro servicio,
                enviamos este correo con información esencial relacionada con tu cuenta,
                compra, reserva o suscripción. En Linkiu respetamos y protegemos
                tu privacidad de acuerdo con nuestra
                <a href="https://linkiu.bio/politics-privacy" style="color:#90A1B9;text-decoration:underline;font-size:11px;">Política de privacidad</a>.
                Si tienes preguntas, escríbenos por nuestra
                <a href="https://wa.me/573104594344" style="color:#90A1B9;text-decoration:underline;font-size:11px;">línea de WhatsApp</a>.
            </p>

            <p style="font-size:12px;color:#90A1B9;margin:14px 0 0;text-align:center;">
                <a href="https://linkiu.bio/terms" style="color:#62748E;text-decoration:none;font-size:12px;">Terms</a>
                <span style="color:#CBD5E2;margin:0 6px;">·</span>
                <a href="https://linkiu.bio/politics-privacy" style="color:#62748E;text-decoration:none;font-size:12px;">Privacy</a>
                <span style="color:#CBD5E2;margin:0 6px;">·</span>
                <a href="https://linkiu.bio/cookies" style="color:#62748E;text-decoration:none;font-size:12px;">Cookies</a>
                <span style="color:#CBD5E2;margin:0 6px;">·</span>
                <a href="mailto:soporte@linkiu.bio" style="color:#62748E;text-decoration:none;font-size:12px;">Soporte</a>
            </p>

            <p style="font-size:11px;color:#CBD5E2;margin:14px 0 0;text-align:center;line-height:1.6;">
                ©2026 Desde Magangué para el mundo — Hecho con el ❤️<br>
                Recibes este correo porque contiene información importante relacionada con tu actividad en Linkiu.
            </p>

        </div>

    </div>

</body>
</html>
