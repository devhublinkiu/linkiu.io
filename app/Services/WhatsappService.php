<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappService
{
    private string $apiKey;
    private string $baseUrl;
    private string $sender;
    private string $otpTemplate;

    public function __construct()
    {
        $this->apiKey      = config('whatsapp.api_key');
        $this->baseUrl     = rtrim(config('whatsapp.base_url'), '/');
        $this->sender      = config('whatsapp.sender');
        $this->otpTemplate = config('whatsapp.otp_template');
    }

    public function enviarOTP(string $telefono, string $codigo): bool
    {
        $payload = [
            'messages' => [
                [
                    'from'    => $this->sender,
                    'to'      => $this->normalizarTelefono($telefono),
                    'content' => [
                        'templateName' => $this->otpTemplate,
                        'templateData' => [
                            'body' => [
                                'placeholders' => [$codigo],
                            ],
                            'buttons' => [
                                [
                                    'type'      => 'URL',
                                    'parameter' => $codigo,
                                ],
                            ],
                        ],
                        'language' => 'es_CO',
                    ],
                ],
            ],
        ];

        $url = "{$this->baseUrl}/whatsapp/1/message/template";

        Log::info('WhatsappService: enviando OTP', [
            'url'     => $url,
            'payload' => $payload,
        ]);

        try {
            $respuesta = Http::withHeaders([
                'Authorization' => 'App ' . $this->apiKey,
                'Content-Type'  => 'application/json',
                'Accept'        => 'application/json',
            ])->post($url, $payload);

            Log::info('WhatsappService: respuesta', [
                'status' => $respuesta->status(),
                'body'   => $respuesta->json(),
            ]);

            if ($respuesta->failed()) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('WhatsappService: excepción', [
                'telefono' => $telefono,
                'mensaje'  => $e->getMessage(),
            ]);

            return false;
        }
    }

    // Asegura formato internacional sin el símbolo +
    private function normalizarTelefono(string $telefono): string
    {
        return preg_replace('/[^0-9]/', '', $telefono);
    }
}
