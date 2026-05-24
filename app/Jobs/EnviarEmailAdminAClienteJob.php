<?php

namespace App\Jobs;

use App\Mail\AdminEmailClienteMail;
use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Envía el email manual del admin al cliente fuera del ciclo del request.
 *
 * Sin retries automáticos: si Resend rechaza el envío, no queremos
 * spamear al cliente con duplicados. El error queda logueado para que el
 * admin pueda reintentar manualmente.
 */
class EnviarEmailAdminAClienteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public function __construct(
        public Client $cliente,
        public string $asunto,
        public string $mensaje,
    ) {}

    public function handle(): void
    {
        try {
            Mail::to($this->cliente->email)
                ->send(new AdminEmailClienteMail($this->cliente, $this->asunto, $this->mensaje));
        } catch (\Exception $e) {
            Log::error('Job EnviarEmailAdminAClienteJob: ' . $e->getMessage(), [
                'cliente_id' => $this->cliente->id,
                'asunto'     => $this->asunto,
            ]);
        }
    }
}
