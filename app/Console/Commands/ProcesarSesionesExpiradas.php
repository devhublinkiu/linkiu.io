<?php

namespace App\Console\Commands;

use App\Actions\VistaEnVivo\PersistirSesion;
use App\Http\Controllers\Public\HeartbeatController;
use App\Support\VistaEnVivo\Visitante;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

/**
 * Procesa visitantes "fantasma" — sesiones que estan en el hash
 * vivo:visitantes pero ya NO en el sorted set vivo:online porque
 * expiraron sin disparar disconnect explicito (crash de navegador,
 * red caida, etc.).
 *
 * Los persiste a BD antes de limpiar el hash para no perder data
 * de funnel.
 *
 * Pensado para correr cada minuto.
 */
class ProcesarSesionesExpiradas extends Command
{
    protected $signature = 'linkiu:vivo:procesar-sesiones-expiradas';

    protected $description = 'Persiste a BD los visitantes que expiraron del sorted set sin disparar disconnect';

    public function handle(PersistirSesion $persistir): int
    {
        try {
            $hash    = Redis::hgetall(HeartbeatController::KEY_VISITANTES) ?: [];
            if (empty($hash)) return self::SUCCESS;

            $umbral  = time() - HeartbeatController::TTL_PRESENCIA;
            $activos = Redis::zrangebyscore('vivo:online', $umbral, '+inf') ?: [];
            $activosSet = array_flip($activos);

            $procesados = 0;
            foreach ($hash as $cliente => $json) {
                if (isset($activosSet[$cliente])) continue;  // sigue activo, skip

                $v = Visitante::fromJson((string) $json);
                if ($v) $persistir->execute($v);

                Redis::hdel(HeartbeatController::KEY_VISITANTES, $cliente);
                $procesados++;
            }

            if ($procesados > 0) {
                $this->info("Procesadas {$procesados} sesiones expiradas.");
            }

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Error: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
