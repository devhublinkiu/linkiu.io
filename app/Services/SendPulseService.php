<?php

namespace App\Services;

use App\Models\BuildConfig;
use App\Models\Integracion;
use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendPulseService
{
    private string $clientId;
    private string $clientSecret;
    private string $botId;

    public function __construct()
    {
        $this->clientId     = config('sendpulse.client_id');
        $this->clientSecret = config('sendpulse.client_secret');
        $this->botId        = config('sendpulse.bot_id');
    }

    public function notificarOrdenCreada(Order $orden): bool
    {
        return $this->enviarPlantilla($orden->telefono, 'order_received_v1', [
            $orden->nombre,
            $orden->codigo,
            '$' . number_format($orden->total, 0, ',', '.'),
            url("/orden/{$orden->acceso_token}"),
            BuildConfig::get('build_seo_telefono_tienda', config('sendpulse.merchant_phone', '')),
        ]);
    }

    /**
     * Envía la plantilla `order_received_cod_v1` con botones Quick Reply
     * "Sí, confirmo" / "No, cancelar". Pensada para pedidos contraentrega
     * que pasaron el filtro antifraude — el cliente decide en el mismo mensaje.
     *
     * ANTES de enviar la plantilla, setea la variable `tienda_callback_url`
     * del contacto. El router central (linkiu.com.co/webhook.php) lee esa
     * variable del webhook para reenviar la respuesta del cliente al servidor
     * correcto. Multi-tenant: un solo bot SendPulse compartido, varias tiendas
     * con dominios distintos.
     */
    public function notificarOrdenCreadaCod(Order $orden): bool
    {
        $this->setearCallbackUrlEnContacto($orden->telefono);

        return $this->enviarPlantilla($orden->telefono, 'order_received_cod_v1', [
            $orden->nombre,
            $orden->codigo,
            '$' . number_format($orden->total, 0, ',', '.'),
            $orden->ciudad,
            BuildConfig::get('build_seo_telefono_tienda', config('sendpulse.merchant_phone', '')),
        ]);
    }

    /**
     * Variante "raw" para testing — mismo template pero con valores arbitrarios,
     * sin necesitar un Order persistido. Usado por sendpulse:test-cod.
     */
    public function notificarOrdenCreadaCodRaw(
        string $telefono,
        string $nombre,
        string $codigo,
        int $total,
        string $ciudad,
    ): bool {
        $this->setearCallbackUrlEnContacto($telefono);

        return $this->enviarPlantilla($telefono, 'order_received_cod_v1', [
            $nombre,
            $codigo,
            '$' . number_format($total, 0, ',', '.'),
            $ciudad,
            BuildConfig::get('build_seo_telefono_tienda', config('sendpulse.merchant_phone', '+57 300 000 0000')),
        ]);
    }

    /**
     * Setea la variable `tienda_callback_url` del contacto en SendPulse para
     * que el router central pueda reenviar el webhook a esta instalación.
     * Si falla, log y seguimos — la plantilla se envía igual pero la
     * confirmación del cliente no podrá enrutarse hasta acá.
     */
    private function setearCallbackUrlEnContacto(string $telefono): bool
    {
        $token = Integracion::get('sendpulse_webhook_token');
        if (! $token) {
            Log::warning('SendPulseService: sin sendpulse_webhook_token configurado — no se puede setear tienda_callback_url. Corré php artisan sendpulse:webhook-token.');
            return false;
        }

        $callbackUrl = url('/webhooks/sendpulse') . '?token=' . $token;

        return $this->setearVariableContacto($telefono, 'tienda_callback_url', $callbackUrl);
    }

    /**
     * Llama a la API SendPulse para setear (o actualizar) una variable del
     * contacto identificado por teléfono. La variable debe existir antes en
     * el bot — se crea desde el panel SendPulse en Audience > Variables.
     */
    private function setearVariableContacto(string $telefono, string $variable, string $valor): bool
    {
        if (! $this->clientId || ! $this->clientSecret || ! $this->botId) {
            return false;
        }

        $telefonoNormalizado = $this->normalizarTelefono($telefono);

        try {
            $accessToken = $this->getToken();
            if (! $accessToken) return false;

            $respuesta = Http::withToken($accessToken)
                ->post('https://api.sendpulse.com/whatsapp/contacts/setVariablesByPhone', [
                    'bot_id'    => $this->botId,
                    'phone'     => $telefonoNormalizado,
                    'variables' => [
                        $variable => $valor,
                    ],
                ]);

            if ($respuesta->failed()) {
                Log::warning('SendPulseService: setearVariableContacto falló', [
                    'variable' => $variable,
                    'phone'    => $telefonoNormalizado,
                    'status'   => $respuesta->status(),
                    'body'     => $respuesta->json(),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('SendPulseService: setearVariableContacto excepción', [
                'mensaje' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Notifica el pedido nuevo a TODOS los destinatarios configurados en
     * LinkiuBuild → Theme → SEO → Notificaciones de pedidos.
     *
     * Resolución:
     *  1) Si hay lista de destinatarios → envía a cada uno
     *  2) Si la lista está vacía → fallback al build_seo_telefono_tienda
     *     (retrocompatibilidad con instalaciones que aún no tienen lista)
     *  3) Si tampoco hay teléfono público → no-op silencioso
     *
     * Devuelve true si AL MENOS un envío fue exitoso.
     */
    public function notificarOrdenAlDueno(Order $orden): bool
    {
        $nombreTienda = BuildConfig::get('build_seo_nombre_tienda', config('app.name', 'Tu tienda'));
        $destinatarios = $this->resolverDestinatariosNotif();

        if (empty($destinatarios)) {
            Log::info('SendPulseService: sin destinatarios configurados, se omite notificación al merchant.');
            return false;
        }

        $parametros = [
            $nombreTienda,
            $orden->codigo,
            $orden->nombre . ' ' . ($orden->apellido ?? ''),
            $orden->telefono,
            $orden->ciudad ?? '—',
            number_format($orden->total, 0, ',', '.'),
            url('/admin/ordenes'),
        ];

        $alMenosUnoOk = false;
        foreach ($destinatarios as $telefono) {
            $ok = $this->enviarPlantilla($telefono, 'new_order_merchant_v1', $parametros);
            $alMenosUnoOk = $alMenosUnoOk || $ok;
        }

        return $alMenosUnoOk;
    }

    /**
     * Devuelve array de teléfonos a notificar. Usa la lista configurada o
     * cae al teléfono público de la tienda como fallback.
     */
    private function resolverDestinatariosNotif(): array
    {
        $raw  = BuildConfig::get('build_notif_pedidos_destinatarios', '[]');
        $lista = json_decode($raw, true) ?: [];

        $telefonos = array_values(array_filter(array_map(
            fn ($d) => trim((string) ($d['telefono'] ?? '')),
            $lista,
        )));

        if (! empty($telefonos)) {
            return $telefonos;
        }

        // Fallback retrocompatible
        $fallback = BuildConfig::get('build_seo_telefono_tienda', config('sendpulse.merchant_phone', ''));
        return $fallback ? [$fallback] : [];
    }

    public function notificarCambioEstado(Order $orden): bool
    {
        $url           = url("/orden/{$orden->acceso_token}");
        $merchantPhone = BuildConfig::get('build_seo_telefono_tienda', config('sendpulse.merchant_phone', ''));

        return match ($orden->estado) {
            'confirmado' => $this->enviarPlantilla($orden->telefono, 'order_confirmed', [
                $orden->nombre,
                $orden->codigo,
                $url,
                $merchantPhone,
            ]),
            // 'preparando' está oculto del UI mientras se reestructura el flujo
            // (Capa 3). Si por API o cron la orden pasa a 'preparando', NO se
            // notifica al cliente — se considera un estado transitorio interno.
            // Cuando se reactive, restaurar la llamada a order_preparing.
            'preparando' => false,
            'enviado' => ($orden->numero_guia && $orden->transportadora)
                ? $this->enviarPlantilla($orden->telefono, 'order_shipped', [
                    $orden->nombre,
                    $orden->codigo,
                    $orden->ciudad,
                    $orden->numero_guia,
                    $orden->transportadora ?? '',
                    $url,
                    $merchantPhone,
                ])
                : $this->enviarPlantilla($orden->telefono, 'order_shipped_no_tracking', [
                    $orden->nombre,
                    $orden->codigo,
                    $orden->ciudad,
                    $url,
                    $merchantPhone,
                ]),
            'entregado' => $this->enviarPlantilla($orden->telefono, 'order_delivered', [
                $orden->nombre,
                $orden->codigo,
                $merchantPhone,
            ]),
            'cancelado' => $this->enviarPlantilla($orden->telefono, 'order_cancelled', [
                $orden->nombre,
                $orden->codigo,
                $merchantPhone,
            ]),
            default => false,
        };
    }

    private function enviarPlantilla(string $telefono, string $plantilla, array $parametros): bool
    {
        if (! $this->clientId || ! $this->clientSecret || ! $this->botId) {
            Log::warning('SendPulseService: credenciales no configuradas', [
                'tiene_client_id'     => (bool) $this->clientId,
                'tiene_client_secret' => (bool) $this->clientSecret,
                'tiene_bot_id'        => (bool) $this->botId,
            ]);
            return false;
        }

        $telefonoNormalizado = $this->normalizarTelefono($telefono);

        try {
            $token = $this->getToken();
            if (! $token) return false;

            $respuesta = Http::withToken($token)
                ->post('https://api.sendpulse.com/whatsapp/contacts/sendTemplateByPhone', [
                    'bot_id'   => $this->botId,
                    'phone'    => $telefonoNormalizado,
                    'template' => [
                        'name'       => $plantilla,
                        'language'   => ['code' => 'es'],
                        'components' => [
                            [
                                'type'       => 'body',
                                'parameters' => array_map(fn ($p) => ['type' => 'text', 'text' => (string) $p], $parametros),
                            ],
                        ],
                    ],
                ]);

            if ($respuesta->failed()) {
                Log::error('SendPulseService: error al enviar plantilla', [
                    'plantilla' => $plantilla,
                    'telefono'  => $telefonoNormalizado,
                    'status'    => $respuesta->status(),
                    'body'      => $respuesta->json(),
                ]);
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('SendPulseService: excepción', ['mensaje' => $e->getMessage()]);
            return false;
        }
    }

    private function getToken(): ?string
    {
        try {
            $respuesta = Http::post('https://api.sendpulse.com/oauth/access_token', [
                'grant_type'    => 'client_credentials',
                'client_id'     => $this->clientId,
                'client_secret' => $this->clientSecret,
            ]);

            return $respuesta->json('access_token');
        } catch (\Exception $e) {
            Log::error('SendPulseService: error obteniendo token', ['mensaje' => $e->getMessage()]);
            return null;
        }
    }

    private function normalizarTelefono(string $telefono): string
    {
        $numero = preg_replace('/[^0-9]/', '', $telefono);
        // Agrega código de Colombia si el número tiene 10 dígitos
        if (strlen($numero) === 10) {
            $numero = '57' . $numero;
        }
        return $numero;
    }
}
