<?php

namespace App\Actions\MetodosPago;

use App\Models\Integracion;
use App\Models\MetodoPago;

class ToggleMetodoPago
{
    /** @throws \InvalidArgumentException */
    public function handle(MetodoPago $metodo): void
    {
        if ($metodo->clave === 'mercadopago' && ! Integracion::get('mp_access_token')) {
            throw new \InvalidArgumentException('Configura las credenciales de Mercado Pago antes de activarlo.');
        }

        $metodo->update(['activo' => ! $metodo->activo]);
    }
}
