<?php

namespace App\Services;

use App\Models\Integracion;
use Illuminate\Support\Str;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Client\Common\RequestOptions;
use MercadoPago\MercadoPagoConfig;

class MercadoPagoService
{
    public function __construct()
    {
        // Configuración lazy: NO leer credenciales en construct. Si se hace
        // aquí y no hay token, todo el controller que inyecta el service
        // explota antes de llegar a su try/catch. Lazy permite que el
        // controller chequee con `tieneCredenciales()` y responda 422
        // user-friendly antes de intentar cobrar.
    }

    /**
     * True si las credenciales del modo activo (sandbox/prod) están
     * configuradas. Llamar antes de `crearPago()` para evitar el
     * RuntimeException de configurarToken.
     */
    public function tieneCredenciales(): bool
    {
        $sandbox = Integracion::get('mp_sandbox', '1') === '1';
        $token   = $sandbox
            ? Integracion::get('mp_access_token_sandbox')
            : Integracion::get('mp_access_token_prod');

        return ! empty($token);
    }

    private function configurarToken(): void
    {
        $sandbox = Integracion::get('mp_sandbox', '1') === '1';
        $token   = $sandbox
            ? Integracion::get('mp_access_token_sandbox')
            : Integracion::get('mp_access_token_prod');

        if (! $token) {
            $modo = $sandbox ? 'prueba' : 'producción';
            throw new \RuntimeException("MercadoPago Access Token de {$modo} no está configurado. Ve a Admin → Integraciones → Pasarelas.");
        }
        MercadoPagoConfig::setAccessToken($token);
    }

    /**
     * Crea un pago en MP y retorna el resultado normalizado.
     *
     * @return array{ id: int, status: string, status_detail: string, external_resource_url: string|null, three_ds_info: array|null }
     */
    public function crearPago(array $formData, string $descripcion, string $notificationUrl, ?string $idempotencyKey = null): array
    {
        $this->configurarToken();

        $client  = new PaymentClient();
        $options = new RequestOptions();
        $options->setCustomHeaders([
            'X-Idempotency-Key: ' . ($idempotencyKey ?? (string) Str::uuid()),
        ]);

        $tieneToken = ! empty($formData['token']);

        $sandbox = Integracion::get('mp_sandbox', '1') === '1';

        $payload = [
            'transaction_amount' => (float) $formData['transaction_amount'],
            'description'        => $descripcion,
            'payment_method_id'  => $formData['payment_method_id'],
            'payer'              => $this->buildPayer($formData['payer'] ?? []),
        ];

        // En sandbox no enviamos notification_url porque el dominio .test no es alcanzable desde internet
        if (! $sandbox) {
            $payload['notification_url'] = $notificationUrl;
        }

        // Campos exclusivos de tarjeta
        if ($tieneToken) {
            $payload['token']               = $formData['token'];
            $payload['installments']        = (int) ($formData['installments'] ?? 1);
            $payload['issuer_id']           = $formData['issuer_id'] ?? null;
            $payload['three_d_secure_mode'] = 'optional';
        }

        // Campos exclusivos de PSE
        if ($formData['payment_method_id'] === 'pse') {
            $payload['transaction_details'] = [
                'financial_institution' => $formData['transaction_details']['financial_institution'],
            ];
            if (! $sandbox) {
                $payload['callback_url'] = route('mp.callback');
            }
        }

        // IVA Colombia
        $iva = $this->calcularIva((float) $formData['transaction_amount']);
        $payload['net_amount'] = $iva['net_amount'];
        $payload['taxes']      = [['value' => $iva['iva_amount'], 'type' => 'IVA']];

        $payment = $client->create($payload, $options);

        return [
            'id'                    => $payment->id,
            'status'                => $payment->status,
            'status_detail'         => $payment->status_detail,
            'external_resource_url' => $payment->transaction_details->external_resource_url ?? null,
            'three_ds_info'         => isset($payment->three_ds_info)
                ? (array) $payment->three_ds_info
                : null,
        ];
    }

    /** Consulta el estado actual de un pago por su ID */
    public function consultarPago(int|string $paymentId): array
    {
        $this->configurarToken();

        $client  = new PaymentClient();
        $payment = $client->get((int) $paymentId);

        return [
            'id'            => $payment->id,
            'status'        => $payment->status,
            'status_detail' => $payment->status_detail,
        ];
    }

    /** Verifica la firma HMAC del webhook */
    public function verificarWebhook(string $xSignature, string $xRequestId, string $dataId): bool
    {
        $secret = Integracion::get('mp_webhook_secret');
        if (! $secret) return false;

        $ts   = null;
        $hash = null;
        foreach (explode(',', $xSignature) as $part) {
            [$key, $val] = array_pad(explode('=', trim($part), 2), 2, null);
            if ($key === 'ts')  $ts   = $val;
            if ($key === 'v1')  $hash = $val;
        }

        if (! $ts || ! $hash) return false;

        $manifest = "id:{$dataId};request-id:{$xRequestId};ts:{$ts};";
        $expected = hash_hmac('sha256', $manifest, $secret);

        return hash_equals($expected, $hash);
    }

    // -------------------------------------------------------------------------

    private function buildPayer(array $payer): array
    {
        $built = ['email' => $payer['email'] ?? ''];

        if (! empty($payer['identification'])) {
            $built['identification'] = [
                'type'   => $payer['identification']['type']   ?? 'CC',
                'number' => $payer['identification']['number'] ?? '',
            ];
        }
        if (! empty($payer['entity_type']))  $built['entity_type']  = $payer['entity_type'];
        if (! empty($payer['first_name']))   $built['first_name']   = $payer['first_name'];
        if (! empty($payer['last_name']))    $built['last_name']     = $payer['last_name'];

        return $built;
    }

    private function calcularIva(float $total): array
    {
        $netAmount = round($total / 1.19, 2);
        $ivaAmount = round($total - $netAmount, 2);
        return ['net_amount' => $netAmount, 'iva_amount' => $ivaAmount];
    }
}
