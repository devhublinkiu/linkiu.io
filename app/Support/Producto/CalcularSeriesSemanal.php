<?php

namespace App\Support\Producto;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Calcula las series de ventas semanales de los últimos 8 weeks para
 * TODOS los productos en una sola query + agregación PHP.
 *
 * Por qué agregación PHP en lugar de GROUP BY SQL: SQLite y MySQL tienen
 * sintaxis distinta para extraer "semana" de una fecha (`strftime` vs
 * `WEEK()`). Hacerlo en PHP es portable y, con <10k order_items en 8
 * semanas, el costo es despreciable.
 *
 * Retorno: `[producto_id => [s0, s1, ..., s7]]` donde s0 es la última
 * semana (más reciente) y s7 hace 7-8 semanas.
 */
class CalcularSeriesSemanal
{
    public function ejecutar(): array
    {
        $ahora  = Carbon::now();
        $cutoff = $ahora->copy()->subWeeks(8);

        $rows = DB::table('order_items')
            ->select('producto_id', 'cantidad', 'created_at')
            ->whereNotNull('producto_id')
            ->where('created_at', '>=', $cutoff)
            ->get();

        $series = [];

        foreach ($rows as $r) {
            $created    = Carbon::parse($r->created_at);
            $weekOffset = (int) floor($ahora->diffInDays($created, false) * -1 / 7);

            if ($weekOffset < 0 || $weekOffset >= 8) {
                continue;
            }

            if (! isset($series[$r->producto_id])) {
                $series[$r->producto_id] = array_fill(0, 8, 0);
            }

            $series[$r->producto_id][$weekOffset] += (int) $r->cantidad;
        }

        return $series;
    }

    /**
     * Helper para tests/seeders: retorna la serie de un producto puntual
     * o un array de 8 ceros si no tiene ventas.
     */
    public function paraProducto(int $productoId): array
    {
        $todas = $this->ejecutar();
        return $todas[$productoId] ?? array_fill(0, 8, 0);
    }
}
