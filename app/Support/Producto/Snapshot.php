<?php

namespace App\Support\Producto;

use App\Enums\ProductoSenal;

/**
 * Resultado de evaluar el performance de un producto. Es lo que
 * eventualmente llega al frontend como parte del payload Inertia.
 *
 * - `score` (0-100, nullable): percentil de conversion del producto en
 *   el catalogo. null si vistas_7d < UMBRAL (no hay data confiable).
 * - `conversion_pct` (nullable): % crudo de conversion para mostrar al
 *   admin junto al percentil ("5.0% · P70"). null si sin data.
 * - `temperatura` (0-100): demanda absoluta calibrada al p75.
 * - `tendencia`: direccion + magnitud vs baseline 4 semanas.
 * - `senal`: diagnostico cualitativo (null si nada matchea).
 * - `debug`: metricas intermedias para tooltips.
 */
class Snapshot
{
    public function __construct(
        public readonly ?int $score,
        public readonly ?float $conversion_pct,
        public readonly int $temperatura,
        public readonly ?int $valor,       // percentil 0-100, null si sin ventas en 7d
        public readonly int $revenue_7d,   // monto crudo en moneda (pesos)
        public readonly Tendencia $tendencia,
        public readonly ?ProductoSenal $senal,
        public readonly array $debug,
    ) {}

    public function toArray(): array
    {
        return [
            'score'          => $this->score,
            'conversion_pct' => $this->conversion_pct,
            'temperatura'    => $this->temperatura,
            'valor'          => $this->valor,
            'revenue_7d'     => $this->revenue_7d,
            'tendencia'   => [
                'direccion'                => $this->tendencia->direccion,
                'pct'                      => $this->tendencia->pct,
                'tiene_senal'              => $this->tendencia->tiene_senal,
                'ventas_actual'            => $this->tendencia->ventas_actual,
                'ventas_baseline_promedio' => $this->tendencia->ventas_baseline_promedio,
            ],
            'senal'       => $this->senal?->toArray(),
            'debug'       => $this->debug,
        ];
    }
}
