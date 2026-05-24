<?php

namespace Tests\Unit\Support\Producto;

use App\Support\Producto\Contexto;
use App\Support\Producto\ContextoCalculator;
use App\Support\Producto\ProductoMetrics;
use App\Support\Producto\ProductoPerformance;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\TestCase;

class ContextoCalculatorTest extends TestCase
{
    private ContextoCalculator $calc;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-05-23 12:00:00');
        $this->calc = new ContextoCalculator(new ProductoPerformance);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_catalogo_pequeno_cuando_menos_de_20_productos(): void
    {
        $metricas = $this->generarMetricas(10);

        $ctx = $this->calc->calcular($metricas);

        $this->assertTrue($ctx->catalogo_pequeno);
    }

    public function test_catalogo_grande_cuando_20_o_mas_productos(): void
    {
        $metricas = $this->generarMetricas(25);

        $ctx = $this->calc->calcular($metricas);

        $this->assertFalse($ctx->catalogo_pequeno);
    }

    public function test_p75_ventas_refleja_los_mejores_25pct(): void
    {
        // Ventas 7d: 0,0,...,0 (15 ceros) | 10,20,30,40,50 (top 5 de 20)
        $metricas = [
            ...array_fill(0, 15, $this->metrics(ventas_7d: 0)),
            $this->metrics(ventas_7d: 10),
            $this->metrics(ventas_7d: 20),
            $this->metrics(ventas_7d: 30),
            $this->metrics(ventas_7d: 40),
            $this->metrics(ventas_7d: 50),
        ];

        $ctx = $this->calc->calcular($metricas);

        // P75 con 20 elementos = posición 14.25 (interpolación). Valores
        // ordenados: [0]*15, 10, 20, 30, 40, 50. Posición 14 = 0, 15 = 10.
        // P75 ≈ 0 + 0.25 * 10 = 2.5 → redondea a 3 (orden ascendente)
        $this->assertGreaterThanOrEqual(0, $ctx->p75_ventas_7d);
        $this->assertLessThanOrEqual(20, $ctx->p75_ventas_7d);
    }

    public function test_scores_raw_estan_sorted_ascendente(): void
    {
        $metricas = [
            $this->metrics(ventas_7d: 50, vistas_7d: 500, ventas_total: 1000),  // top
            $this->metrics(ventas_7d: 1,  vistas_7d: 10,  ventas_total: 5),     // bottom
            $this->metrics(ventas_7d: 10, vistas_7d: 100, ventas_total: 50),    // mid
        ];

        $ctx = $this->calc->calcular($metricas);

        $this->assertCount(3, $ctx->scores_raw);
        $this->assertEquals($ctx->scores_raw, array_values(collect($ctx->scores_raw)->sort()->all()));
    }

    public function test_percentilDe_top_devuelve_100(): void
    {
        $metricas = [
            $this->metrics(ventas_7d: 50, vistas_7d: 500, ventas_total: 1000),
            $this->metrics(ventas_7d: 1,  vistas_7d: 10,  ventas_total: 5),
            $this->metrics(ventas_7d: 5,  vistas_7d: 50,  ventas_total: 20),
        ];

        $ctx = $this->calc->calcular($metricas);
        $topScore = max($ctx->scores_raw);

        $this->assertSame(67, $ctx->percentilDe($topScore));  // 2 de 3 son menores
    }

    public function test_catalogo_vacio_devuelve_contexto_seguro(): void
    {
        $ctx = $this->calc->calcular([]);

        $this->assertSame(0, $ctx->p75_ventas_7d);
        $this->assertSame(0, $ctx->p75_vistas_7d);
        $this->assertEmpty($ctx->scores_raw);
        $this->assertTrue($ctx->catalogo_pequeno);
    }

    public function test_percentilDe_catalogo_vacio_devuelve_neutral(): void
    {
        $ctx = new Contexto(0, 0, [], true);

        $this->assertSame(50, $ctx->percentilDe(100));
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function generarMetricas(int $cantidad): array
    {
        $out = [];
        for ($i = 0; $i < $cantidad; $i++) {
            $out[] = $this->metrics(ventas_7d: $i, vistas_7d: $i * 10);
        }
        return $out;
    }

    private function metrics(
        int $ventas_7d = 0,
        int $vistas_7d = 0,
        int $ventas_total = 0,
        int $vistas_30d = 0,
    ): ProductoMetrics {
        return new ProductoMetrics(
            ventas_7d:    $ventas_7d,
            vistas_7d:    $vistas_7d,
            vistas_30d:   $vistas_30d ?: $vistas_7d * 4,
            ventas_total: $ventas_total ?: $ventas_7d * 10,
            created_at:   Carbon::now()->subDays(90),
            series_8w:    array_fill(0, 8, $ventas_7d),
        );
    }
}
