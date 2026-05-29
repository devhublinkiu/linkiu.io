<?php

namespace App\Actions\Antifraude;

use App\Actions\Orders\UpdateOrderEstado;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;

/**
 * Rechaza la orden bajo revisión y la cancela. Delega la transición de estado
 * a UpdateOrderEstado para que dispare la plantilla `order_cancelled` al
 * cliente — mantiene el flujo de notificaciones existente.
 *
 * El comentario del admin se persiste en revision_comentario; el motivo
 * mostrado al cliente en WhatsApp/email es el motivo_cancelacion (pre-formato).
 */
class RechazarOrden
{
    public function __construct(
        private readonly UpdateOrderEstado $updateEstado,
    ) {}

    public function execute(Order $orden, string $comentario): void
    {
        // 1) Marcar revisión como rechazada (auditoría)
        $orden->update([
            'revision_estado'       => 'rechazada',
            'revision_revisada_por' => Auth::id(),
            'revision_revisada_at'  => now(),
            'revision_comentario'   => $comentario,
        ]);

        // 2) Cancelar la orden por el flujo normal → dispara order_cancelled
        //    al cliente con el motivo. Refrescamos para que el update anterior
        //    quede aplicado antes de la transición.
        $this->updateEstado->execute(
            order:             $orden->fresh(),
            estado:            'cancelado',
            motivoCancelacion: 'Rechazada por revisión: ' . $comentario,
        );
    }
}
