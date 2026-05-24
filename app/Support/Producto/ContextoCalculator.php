<?php

namespace App\Support\Producto;

/**
 * Construye el `Contexto` del catálogo a partir de los `ProductoMetrics`
 * de todos los productos activos. Hace 2 passes:
 *
 *   1. Calcula `score_raw` y tendencia de cada producto.
 *   2. Computa percentil 75 de ventas/vistas y ordena los scores_raw.
 *
 * El Contexto resultante se pasa al `ProductoPerformance::snapshot` de
 * cada producto para que pueda calcular su score percentil final.
 *
 * 100% puro: no toca BD ni cache.
 */
class ContextoCalculator
{
    public function __construct(
        private readonly ProductoPerformance $performance,
    ) {}

    /**
     * @param  iterable<ProductoMetrics>  $metricas
     */
    public function calcular(iterable $metricas): Contexto
    {
        $ventas7d   = [];
        $vistas7d   = [];
        $scoresRaw  = [];
        $contador   = 0;

        foreach ($metricas as $m) {
            $contador++;
            $ventas7d[]  = $m->ventas_7d;
            $vistas7d[]  = $m->vistas_7d;

            $tendencia = $this->performance->calcularTendencia($m->series_8w);
            $scoresRaw[] = $this->performance->calcularScoreRaw($m, $tendencia);
        }

        sort($scoresRaw);

        return new Contexto(
            p75_ventas_7d:    $this->percentil($ventas7d, 75),
            p75_vistas_7d:    $this->percentil($vistas7d, 75),
            scores_raw:       $scoresRaw,
            catalogo_pequeno: $contador < ProductoPerformance::MIN_CATALOG_FOR_PERCENTIL,
        );
    }

    /**
     * Percentil con interpolación lineal (método R-7 / Excel PERCENTILE).
     * Garantiza estabilidad incluso con catálogos chicos.
     */
    private function percentil(array $valores, int $p): int
    {
        if (empty($valores)) {
            return 0;
        }

        sort($valores);
        $n     = count($valores);
        $rank  = ($p / 100) * ($n - 1);
        $lo    = (int) floor($rank);
        $hi    = (int) ceil($rank);

        if ($lo === $hi) {
            return (int) round($valores[$lo]);
        }

        $frac = $rank - $lo;
        return (int) round($valores[$lo] + $frac * ($valores[$hi] - $valores[$lo]));
    }
}
