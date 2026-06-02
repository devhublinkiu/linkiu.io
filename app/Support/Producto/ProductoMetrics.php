<?php

namespace App\Support\Producto;

use Illuminate\Support\Carbon;

/**
 * Datos crudos de un producto, agregados de varias fuentes (orders,
 * product_views, products). Es el INPUT del service
 * `ProductoPerformance::snapshot`.
 *
 * Mantener este DTO 100% serializable y sin dependencias de Eloquent
 * permite testear las fórmulas con fixtures sin cargar BD.
 */
class ProductoMetrics
{
    /**
     * @param  array<int>  $series_8w  Ventas por semana, ordenadas desde la más reciente.
     *                                  [0]=semana actual, [1]=semana -1, ..., [7]=semana -7.
     */
    public function __construct(
        public readonly int $ventas_7d,
        public readonly int $vistas_7d,
        public readonly int $vistas_30d,
        public readonly int $ventas_total,
        public readonly Carbon $created_at,
        public readonly array $series_8w,
        public readonly int $scroll_promedio = 0,
        public readonly int $revenue_7d = 0,
    ) {}

    public function conversionRate(): float
    {
        return $this->ventas_7d / max($this->vistas_7d, 1);
    }

    public function diasDesdeCreacion(): int
    {
        return (int) $this->created_at->diffInDays(Carbon::now());
    }
}
