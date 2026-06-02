<?php

namespace App\Support\Producto;

/**
 * Construye el `Contexto` del catálogo a partir de los `ProductoMetrics`
 * de todos los productos activos. Hace 2 passes:
 *
 *   1. Recolecta ventas_7d, vistas_7d y conversion rates (solo de productos
 *      con vistas suficientes para que la conversion sea confiable).
 *   2. Computa percentil 75 de ventas/vistas y deja sorted las conversion_rates.
 *
 * El Contexto resultante se pasa al `ProductoPerformance::snapshot` de
 * cada producto para que pueda calcular su score (percentil de conversion)
 * y temperatura (relativa a p75).
 *
 * 100% puro: no toca BD ni cache.
 */
class ContextoCalculator
{
    /**
     * @param  iterable<ProductoMetrics>  $metricas
     */
    public function calcular(iterable $metricas): Contexto
    {
        $ventas7d         = [];
        $vistas7d         = [];
        $conversionRates  = [];
        $revenues7d       = [];
        $contadorConfiable = 0;

        foreach ($metricas as $m) {
            $ventas7d[] = $m->ventas_7d;
            $vistas7d[] = $m->vistas_7d;

            // Solo entran a la distribucion de conversion los productos con
            // suficientes vistas — sino productos con 2 vistas y 1 venta
            // (50% conversion) inflan el catalogo y mienten al resto.
            if ($m->vistas_7d >= ProductoPerformance::UMBRAL_VISTAS_CONFIABLE) {
                $conversionRates[] = $m->conversionRate();
                $contadorConfiable++;
            }

            // Solo entran al ranking de Valor productos que VENDIERON.
            // Los ceros llenarian el bottom y desplazarian artificialmente
            // hacia arriba a cualquiera que vendio una vez.
            if ($m->revenue_7d > 0) {
                $revenues7d[] = $m->revenue_7d;
            }
        }

        sort($conversionRates);
        sort($revenues7d);

        return new Contexto(
            p75_ventas_7d:    $this->percentil($ventas7d, 75),
            p75_vistas_7d:    $this->percentil($vistas7d, 75),
            conversion_rates: $conversionRates,
            revenues_7d:      $revenues7d,
            catalogo_pequeno: $contadorConfiable < ProductoPerformance::MIN_CATALOG_FOR_PERCENTIL,
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
