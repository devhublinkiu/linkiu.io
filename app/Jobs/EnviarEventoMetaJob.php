<?php

namespace App\Jobs;

use App\Actions\Meta\EnviarEventoMeta;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Despacho async de eventos a Meta CAPI.
 *
 * En dev (QUEUE_CONNECTION=sync) corre inmediato. En prod (redis) lo procesa
 * el worker. Los eventos no son ultra-críticos para tiempo real: si tardan
 * 1-2 segundos en llegar a Meta no pasa nada.
 *
 * 3 intentos con backoff exponencial. Si los 3 fallan, log y descarte —
 * NO reintenta indefinidamente para no acumular jobs si Meta está caído.
 */
class EnviarEventoMetaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 15;

    public function __construct(
        public string  $eventName,
        public string  $eventId,
        public int     $eventTime,
        public string  $eventSourceUrl,
        public array   $userData,
        public array   $customData = [],
        public ?string $testEventCode = null,
    ) {}

    public function handle(EnviarEventoMeta $action): void
    {
        $action->execute(
            $this->eventName,
            $this->eventId,
            $this->eventTime,
            $this->eventSourceUrl,
            $this->userData,
            $this->customData,
            $this->testEventCode,
        );
    }

    public function backoff(): array
    {
        return [10, 30];
    }
}
