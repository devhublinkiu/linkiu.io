<?php

namespace App\Jobs;

use App\Mail\OrdenEstadoCambiadoMail;
use App\Models\Order;
use App\Services\SendPulseService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Notifica un cambio de estado de orden por todos los canales: Ably (cliente
 * en la página de seguimiento), Mail (cliente), SendPulse (WhatsApp).
 *
 * Cada canal con su propio try/catch.
 */
class NotificarOrdenEstadoCambiado implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public function __construct(public Order $orden)
    {
    }

    public function handle(SendPulseService $sendPulse): void
    {
        try {
            $ably = new \Ably\AblyRest(config('broadcasting.connections.ably.key'));
            $ably->channels->get('orders.' . $this->orden->codigo)->publish('orden.actualizada', [
                'codigo'         => $this->orden->codigo,
                'estado'         => $this->orden->estado,
                'numero_guia'    => $this->orden->numero_guia,
                'transportadora' => $this->orden->transportadora,
            ]);
        } catch (\Throwable $e) {
            Log::error('Job NotificarOrdenEstadoCambiado Ably: ' . $e->getMessage());
        }

        try {
            Mail::to($this->orden->email)->send(new OrdenEstadoCambiadoMail($this->orden));
        } catch (\Throwable $e) {
            Log::error('Job NotificarOrdenEstadoCambiado Mail: ' . $e->getMessage());
        }

        try {
            $sendPulse->notificarCambioEstado($this->orden);
        } catch (\Throwable $e) {
            Log::error('Job NotificarOrdenEstadoCambiado SendPulse: ' . $e->getMessage());
        }
    }
}
