<?php

namespace App\Actions\Orders;

use App\Jobs\NotificarOrdenEstadoCambiado;
use App\Models\Order;

class UpdateOrderEstado
{
    public function execute(
        Order $order,
        string $estado,
        ?string $numeroGuia = null,
        ?string $transportadora = null,
        ?string $motivoCancelacion = null,
    ): void {
        $datos = ['estado' => $estado];

        if ($estado === 'enviado') {
            if ($numeroGuia)     $datos['numero_guia']    = $numeroGuia;
            if ($transportadora) $datos['transportadora'] = $transportadora;
        }

        if ($estado === 'cancelado') {
            $datos['motivo_cancelacion'] = $motivoCancelacion ?: null;
        }

        $order->update($datos);

        // Background: Ably (cliente realtime) + Mail + WhatsApp. El admin no espera.
        NotificarOrdenEstadoCambiado::dispatch($order->fresh());
    }
}
