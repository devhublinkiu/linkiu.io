<?php

namespace App\Support\Producto;

use App\Enums\ProductoSenal;

/**
 * Resultado de evaluar el performance de un producto. Es lo que
 * eventualmente llega al frontend como parte del payload Inertia.
 *
 * `debug` contiene métricas intermedias (conversion_rate, etc.) útiles
 * para tooltips ricos sin recalcular en frontend.
 */
class Snapshot
{
    public function __construct(
        public readonly int $score,            // 0-100, percentil del catálogo
        public readonly int $temperatura,      // 0-100, absoluta
        public readonly Tendencia $tendencia,
        public readonly ?ProductoSenal $senal, // null si ninguna señal matchea
        public readonly array $debug,          // métricas intermedias para tooltips
    ) {}

    public function toArray(): array
    {
        return [
            'score'       => $this->score,
            'temperatura' => $this->temperatura,
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
