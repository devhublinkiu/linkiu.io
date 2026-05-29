<?php

namespace App\Actions\Orders;

use App\Models\Order;
use App\Services\SendPulseService;

/**
 * Dispara la plantilla WhatsApp `order_received_cod_v1` con botones Quick Reply
 * "Sí, confirmo" / "No, cancelar" al cliente. Marca el timestamp para que el
 * Index pueda mostrar el badge "Esperando respuesta" y, después de 6h sin
 * respuesta, ofrecer el botón "Reenviar confirmación".
 *
 * Usada en dos lugares:
 *   1. Hook de CrearOrden cuando el método es contraentrega Y antifraude no
 *      la marcó pendiente.
 *   2. Endpoint admin "Reenviar confirmación" del Index (manual, máx 1 reenvío).
 *
 * Idempotencia: no chequea si ya se envió antes — la lógica de "no reenviar
 * más de 1 vez" la maneja el caller (Controller del reenvío valida
 * `confirmacion_reenviada = false` antes de llamar).
 */
class EnviarConfirmacionCod
{
    public function __construct(private readonly SendPulseService $sendpulse) {}

    /**
     * @param  bool  $esReenvio  Si true, marca confirmacion_reenviada = true
     */
    public function execute(Order $orden, bool $esReenvio = false): bool
    {
        $ok = $this->sendpulse->notificarOrdenCreadaCod($orden);

        // Marcamos el timestamp SI o SÍ — incluso si SendPulse falla. Así el
        // admin puede ver el intento desde el Index. Si falla, queda log en
        // storage/logs/laravel.log.
        $orden->update([
            'confirmacion_solicitada_at' => now(),
            'confirmacion_reenviada'     => $esReenvio ? true : $orden->confirmacion_reenviada,
        ]);

        return $ok;
    }
}
