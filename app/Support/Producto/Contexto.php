<?php

namespace App\Support\Producto;

/**
 * Snapshot de benchmarks del catálogo activo. Se calcula UNA VEZ por
 * request del listado (cacheable) y se pasa a cada llamada de
 * `ProductoPerformance::snapshot` para evitar recalcular.
 *
 * - `p75_ventas_7d` / `p75_vistas_7d`: percentil 75 — umbral adaptativo
 *   que reemplaza las constantes mágicas (20/200) de la versión anterior.
 * - `conversion_rates`: array sorted con las tasas de conversion del
 *   catálogo, usado para calcular el percentil de cada producto en Score.
 *   Solo incluye productos con vistas >= UMBRAL para no diluir la
 *   distribución con productos sin data.
 * - `catalogo_pequeno`: true si <20 productos activos confiables — afecta
 *   la interpretacion del percentil (en chico, salta mucho).
 */
class Contexto
{
    /**
     * @param  array<float>  $conversion_rates  Sorted ascendente.
     * @param  array<int>    $revenues_7d       Sorted ascendente. Solo
     *                                          incluye productos con
     *                                          revenue > 0 (los ceros no
     *                                          contaminan el percentil).
     */
    public function __construct(
        public readonly int $p75_ventas_7d,
        public readonly int $p75_vistas_7d,
        public readonly array $conversion_rates,
        public readonly array $revenues_7d,
        public readonly bool $catalogo_pequeno,
    ) {}

    /**
     * Devuelve el percentil 0-100 de la tasa de conversion dentro del
     * catalogo. Si el catalogo aun no tiene productos con data confiable,
     * devuelve 50 como neutral.
     */
    public function percentilDeConversion(float $tasa): int
    {
        return $this->percentil($this->conversion_rates, $tasa);
    }

    /**
     * Devuelve el percentil 0-100 del revenue dentro del catalogo. Solo
     * compara contra productos que VENDIERON (revenue > 0) — un producto
     * sin ventas no debe entrar al ranking de Valor.
     */
    public function percentilDeRevenue(int $revenue): int
    {
        return $this->percentil($this->revenues_7d, $revenue);
    }

    private function percentil(array $valores, float $valor): int
    {
        $n = count($valores);
        if ($n === 0) {
            return 50;
        }

        $menores = 0;
        foreach ($valores as $v) {
            if ($v < $valor) {
                $menores++;
            } else {
                break;
            }
        }

        return (int) round(($menores / $n) * 100);
    }
}
