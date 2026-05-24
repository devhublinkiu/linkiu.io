<?php

namespace App\Support\Producto;

/**
 * Snapshot de benchmarks del catálogo activo. Se calcula UNA VEZ por
 * request del listado (cacheable) y se pasa a cada llamada de
 * `ProductoPerformance::snapshot` para evitar recalcular.
 *
 * - `p75_ventas_7d` / `p75_vistas_7d`: percentil 75 — umbral adaptativo
 *   que reemplaza las constantes mágicas (20/200) de la versión anterior.
 * - `scores_raw`: array sorted con los scores crudos del catálogo, usado
 *   para calcular percentil de cada producto.
 * - `catalogo_pequeno`: true si <20 productos activos — fuerza usar
 *   `score_raw` escalado en vez de percentil (saltos abruptos con N chico).
 */
class Contexto
{
    /**
     * @param  array<float>  $scores_raw  Sorted ascendente.
     */
    public function __construct(
        public readonly int $p75_ventas_7d,
        public readonly int $p75_vistas_7d,
        public readonly array $scores_raw,
        public readonly bool $catalogo_pequeno,
    ) {}

    /**
     * Devuelve el percentil 0-100 del score_raw dado dentro del catálogo.
     * Usa interpolación lineal entre elementos para evitar saltos.
     */
    public function percentilDe(float $scoreRaw): int
    {
        $n = count($this->scores_raw);
        if ($n === 0) {
            return 50;
        }

        $menores = 0;
        foreach ($this->scores_raw as $s) {
            if ($s < $scoreRaw) {
                $menores++;
            } else {
                break;
            }
        }

        return (int) round(($menores / $n) * 100);
    }
}
