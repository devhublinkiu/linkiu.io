<?php

namespace App\Actions\Reset;

use App\Models\Order;
use App\Models\OrderDeletionLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Elimina órdenes en lote dejando un audit log inmutable. Hard-delete:
 *
 *  1. Suma el total de las órdenes (para el log).
 *  2. Borra los comprobantes en S3 (falla silenciosa por archivo — si uno
 *     no existe ya, sigue con el resto).
 *  3. Elimina items + orders en transacción.
 *  4. Escribe OrderDeletionLog con códigos, motivo, monto, usuario.
 *
 * El cache de countPendientes se invalida automáticamente vía el observer
 * `saved`/`deleted` del modelo Order.
 */
class EliminarOrdenes
{
    /**
     * @param  int[]  $ids   IDs de las órdenes a borrar.
     * @param  string $motivo
     * @return int Cantidad de órdenes eliminadas.
     */
    public function execute(array $ids, string $motivo): int
    {
        $ordenes = Order::whereIn('id', $ids)->get(['id', 'codigo', 'total', 'comprobante_path']);

        if ($ordenes->isEmpty()) {
            return 0;
        }

        $codigos     = $ordenes->pluck('codigo')->toArray();
        $totalCop    = (int) $ordenes->sum('total');
        $comprobantes = $ordenes->pluck('comprobante_path')->filter()->toArray();

        // Borrar comprobantes en S3 ANTES de la transacción de BD — si falla S3
        // no impedimos borrar la orden (los huérfanos los limpia el cron).
        foreach ($comprobantes as $ruta) {
            try {
                Storage::disk('s3')->delete($ruta);
            } catch (\Throwable $e) {
                Log::warning("EliminarOrdenes::s3 fallo borrando {$ruta}: " . $e->getMessage());
            }
        }

        DB::transaction(function () use ($ordenes, $codigos, $motivo, $totalCop) {
            // FK cascade on delete debería borrar order_items, pero por defensa
            // borramos explícito por si la migración original no lo definió así.
            foreach ($ordenes as $orden) {
                $orden->items()->delete();
            }
            Order::whereIn('id', $ordenes->pluck('id'))->delete();

            OrderDeletionLog::create([
                'codigos'             => $codigos,
                'motivo'              => $motivo,
                'total_eliminado_cop' => $totalCop,
                'eliminado_por'       => Auth::id(),
                'eliminado_at'        => now(),
            ]);
        });

        return $ordenes->count();
    }
}
