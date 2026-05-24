<?php

namespace App\Actions\MetodosPago;

use App\Models\MetodoPago;
use App\Services\MercadoPagoService;

class ToggleMetodoPago
{
    public function __construct(
        private readonly MercadoPagoService $mp,
    ) {}

    /**
     * Activa o desactiva un método de pago.
     *
     * Apagar siempre es seguro (sin validación adicional).
     * Encender requiere validación específica por método:
     *  - mercadopago: credenciales del modo activo (sandbox/prod) presentes
     *  - transferencia: banco, número de cuenta y titular configurados
     *  - contraentrega: sin requisitos
     *
     * @throws \InvalidArgumentException
     */
    public function handle(MetodoPago $metodo): void
    {
        if ($metodo->activo) {
            $metodo->update(['activo' => false]);
            return;
        }

        match ($metodo->clave) {
            'mercadopago'   => $this->validarMercadoPago(),
            'transferencia' => $this->validarTransferencia($metodo),
            default         => null,
        };

        $metodo->update(['activo' => true]);
    }

    private function validarMercadoPago(): void
    {
        if (! $this->mp->tieneCredenciales()) {
            throw new \InvalidArgumentException(
                'Configura las credenciales de Mercado Pago antes de activarlo.',
            );
        }
    }

    private function validarTransferencia(MetodoPago $metodo): void
    {
        $cfg = $metodo->config ?? [];

        if (empty($cfg['banco']) || empty($cfg['numero_cuenta']) || empty($cfg['titular'])) {
            throw new \InvalidArgumentException(
                'Completa banco, número de cuenta y titular antes de activar transferencia.',
            );
        }
    }
}
