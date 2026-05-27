<?php

namespace App\Services;

use App\Models\Integracion;

/**
 * Cliente para la pasarela Bold (https://developers.bold.co).
 *
 * Bold opera distinto a MercadoPago Brick: el frontend instancia el SDK JS
 * (BoldCheckout) que abre un iframe modal donde el cliente paga directo
 * con Bold. El backend solo (1) genera la firma de integridad para que
 * el SDK pueda crearse, y (2) valida el webhook al recibir confirmación.
 *
 * No hay un client PHP oficial. Las dos operaciones críticas son hashing
 * (SHA-256 para integrity, HMAC-SHA256 para webhook signature), nativas
 * en PHP — por eso este service no requiere paquete Composer.
 *
 * Documentación:
 *  - Botón embebido: https://developers.bold.co/pagos-en-linea/boton-de-pagos/integracion-manual/integracion-personalizada
 *  - Webhook: https://developers.bold.co/webhook
 */
class BoldService
{
    /**
     * True si las credenciales necesarias están configuradas. El frontend
     * recibe la `identity_key` para el SDK; el `secret_key` se usa solo
     * server-side para hashing.
     */
    public function tieneCredenciales(): bool
    {
        return ! empty(Integracion::get('bold_identity_key'))
            && ! empty(Integracion::get('bold_secret_key'));
    }

    public function obtenerIdentityKey(): ?string
    {
        return Integracion::get('bold_identity_key');
    }

    /**
     * Hash de integridad que valida la transacción al SDK. Formato:
     * SHA-256 hex de `{orderId}{amount}{currency}{secret}`.
     *
     * El SDK lo manda a Bold; si el hash no coincide con lo que Bold
     * calcula del lado del servidor, rechaza la creación de la sesión —
     * defensa contra manipulación del amount desde la consola del cliente.
     */
    public function generarIntegritySignature(string $orderId, int $amount, string $currency = 'COP'): string
    {
        $secret = Integracion::get('bold_secret_key', '');
        return hash('sha256', "{$orderId}{$amount}{$currency}{$secret}");
    }

    /**
     * Verifica el `x-bold-signature` del webhook.
     *
     * Bold envía: HMAC-SHA256(secret, base64(rawBody)) en hex.
     * En sandbox/testing el `secret` puede ser empty string — Bold espera
     * que el cliente lo trate como `''` en ese modo.
     */
    public function verificarWebhook(string $signature, string $rawBody): bool
    {
        if (! $signature) return false;

        $secret  = Integracion::get('bold_secret_key', '');
        $encoded = base64_encode($rawBody);
        $expected = hash_hmac('sha256', $encoded, $secret);

        return hash_equals($expected, $signature);
    }
}
