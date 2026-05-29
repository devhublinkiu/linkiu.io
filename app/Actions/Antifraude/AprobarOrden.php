<?php

namespace App\Actions\Antifraude;

use App\Models\Order;
use Illuminate\Support\Facades\Auth;

/**
 * Aprueba manualmente una orden bajo revisión antifraude. La orden vuelve al
 * flujo normal — los botones de cambio de estado en Show se rehabilitan.
 *
 * No dispara WhatsApp adicional: el cliente ya recibió order_received_v1 al
 * crear la orden y no se le informa del flag de revisión (decisión de UX).
 */
class AprobarOrden
{
    public function execute(Order $orden, ?string $comentario = null): void
    {
        $orden->update([
            'revision_estado'       => 'aprobada',
            'revision_revisada_por' => Auth::id(),
            'revision_revisada_at'  => now(),
            'revision_comentario'   => $comentario,
        ]);
    }
}
