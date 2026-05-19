<?php

namespace App\Services;

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
            url("/orden/{$orden->codigo}"),
            Integracion::get('tienda_telefono', config('sendpulse.merchant_phone', '')),
        ]);
    }

    public function notificarCambioEstado(Order $orden): bool
    {
        $url           = url("/orden/{$orden->codigo}");
        $merchantPhone = Integracion::get('tienda_telefono', config('sendpulse.merchant_phone', ''));

        return match ($orden->estado) {
            'confirmado' => $this->enviarPlantilla($orden->telefono, 'order_confirmed', [
                $orden->nombre,
                $orden->codigo,
                $url,
                $merchantPhone,
            ]),
            'preparando' => $this->enviarPlantilla($orden->telefono, 'order_preparing', [
                $orden->nombre,
                $orden->codigo,
                $url,
                $merchantPhone,
            ]),
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
