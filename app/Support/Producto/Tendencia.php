<?php

namespace App\Support\Producto;

/**
 * Tendencia de ventas de un producto sobre 8 semanas.
 *
 * - `direccion`: 'up' | 'down' | 'neutral' | 'sin_dato'
 * - `pct`: variación porcentual (cap en ±99 para evitar visuales espurios)
 * - `z_score`: desviaciones estándar sobre la baseline (útil para "Trending")
 * - `tiene_senal`: false si volumen total insuficiente para análisis estadístico
 */
class Tendencia
{
    public function __construct(
        public readonly string $direccion,
        public readonly int $pct,
        public readonly float $z_score,
        public readonly bool $tiene_senal,
        public readonly int $ventas_actual,
        public readonly int $ventas_baseline_promedio,
    ) {}

    public static function sinDato(): self
    {
        return new self(
            direccion: 'sin_dato',
            pct: 0,
            z_score: 0.0,
            tiene_senal: false,
            ventas_actual: 0,
            ventas_baseline_promedio: 0,
        );
    }
}
