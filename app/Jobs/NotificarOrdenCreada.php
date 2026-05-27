<?php

namespace App\Jobs;

use App\Mail\OrdenConfirmadaMail;
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
 * Notifica la creación de una orden por todos los canales: Ably (admin
 * realtime), Mail (cliente), SendPulse (WhatsApp al cliente).
 *
 * Cada canal con su propio try/catch — si uno falla los demás siguen.
 * Sin retries automáticos para no spamear al cliente con duplicados.
 */
class NotificarOrdenCreada implements ShouldQueue
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
            $ably->channels->get('admin-orders')->publish('orden.nueva', [
                'id'         => $this->orden->id,
                'codigo'     => $this->orden->codigo,
                'nombre'     => $this->orden->nombre . ' ' . $this->orden->apellido,
                'total'      => $this->orden->total,
                'created_at' => $this->orden->created_at->format('H:i'),
            ]);
        } catch (\Exception $e) {
            Log::error('Job NotificarOrdenCreada Ably: ' . $e->getMessage());
        }

        try {
            Mail::to($this->orden->email)->send(new OrdenConfirmadaMail($this->orden));
        } catch (\Exception $e) {
            Log::error('Job NotificarOrdenCreada Mail: ' . $e->getMessage());
        }

        try {
            $sendPulse->notificarOrdenCreada($this->orden);
        } catch (\Exception $e) {
            Log::error('Job NotificarOrdenCreada SendPulse: ' . $e->getMessage());
        }

        try {
            $sendPulse->notificarOrdenAlDueno($this->orden);
        } catch (\Exception $e) {
            Log::error('Job NotificarOrdenCreada SendPulse (dueño): ' . $e->getMessage());
        }
    }
}
