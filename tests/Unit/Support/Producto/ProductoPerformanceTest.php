<?php

namespace Tests\Unit\Support\Producto;

use App\Enums\ProductoSenal;
use App\Support\Producto\Contexto;
use App\Support\Producto\ProductoMetrics;
use App\Support\Producto\ProductoPerformance;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\TestCase;

class ProductoPerformanceTest extends TestCase
{
    private ProductoPerformance $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProductoPerformance;
        Carbon::setTestNow('2026-05-23 12:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    // ─────────────────────────────────────────────────────────────────
    // TENDENCIA
    // ─────────────────────────────────────────────────────────────────

    public function test_tendencia_sin_dato_cuando_volumen_total_es_bajo(): void
    {
        // Total <8 ventas en 8 semanas: sin señal estadística
        $tendencia = $this->service->calcularTendencia([1, 0, 1, 0, 1, 0, 1, 0]);

        $this->assertSame('sin_dato', $tendencia->direccion);
        $this->assertFalse($tendencia->tiene_senal);
    }

    public function test_tendencia_up_cuando_actual_supera_baseline_significativamente(): void
    {
        // Semana actual: 20, baseline 4 semanas: 5,5,5,5 → z muy alto
        $tendencia = $this->service->calcularTendencia([20, 5, 5, 5, 5, 5, 5, 5]);

        $this->assertSame('up', $tendencia->direccion);
        $this->assertTrue($tendencia->tiene_senal);
        $this->assertSame(20, $tendencia->ventas_actual);
        $this->assertGreaterThan(1.0, $tendencia->z_score);
    }

    public function test_tendencia_down_cuando_actual_cae_significativamente(): void
    {
        $tendencia = $this->service->calcularTendencia([1, 10, 10, 10, 10, 10, 10, 10]);

        $this->assertSame('down', $tendencia->direccion);
        $this->assertLessThan(-0.5, $tendencia->z_score);
    }

    public function test_tendencia_neutral_si_variacion_dentro_de_std(): void
    {
        $tendencia = $this->service->calcularTendencia([11, 10, 10, 10, 10, 10, 10, 10]);

        $this->assertSame('neutral', $tendencia->direccion);
    }

    public function test_tendencia_cap_pct_a_99(): void
    {
        // Crecimiento extremo: actual=100, baseline=1
        $tendencia = $this->service->calcularTendencia([100, 1, 1, 1, 1, 1, 1, 1]);

        $this->assertLessThanOrEqual(99, $tendencia->pct);
    }

    // ─────────────────────────────────────────────────────────────────
    // TEMPERATURA
    // ─────────────────────────────────────────────────────────────────

    public function test_temperatura_alta_para_producto_que_supera_p75_catalogo(): void
    {
        $m = $this->metricsConVentas(ventas_7d: 30, vistas_7d: 200);
        $ctx = $this->contexto(p75_ventas: 10, p75_vistas: 100);

        $temp = $this->service->calcularTemperatura($m, $ctx);

        $this->assertGreaterThanOrEqual(70, $temp);
    }

    public function test_temperatura_baja_para_producto_sin_ventas_ni_vistas(): void
    {
        $m = $this->metricsConVentas(ventas_7d: 0, vistas_7d: 1);
        $ctx = $this->contexto(p75_ventas: 10, p75_vistas: 100);

        $temp = $this->service->calcularTemperatura($m, $ctx);

        $this->assertLessThan(15, $temp);
    }

    public function test_temperatura_se_adapta_a_catalogo_chico(): void
    {
        // Mismo producto (10 ventas/sem). En catálogo modesto es caliente.
        $m = $this->metricsConVentas(ventas_7d: 10, vistas_7d: 50);
        $ctx = $this->contexto(p75_ventas: 5, p75_vistas: 30);

        $tempEnChico = $this->service->calcularTemperatura($m, $ctx);

        // En catálogo grande con bestsellers de 100, el mismo producto es frío.
        $ctxGrande = $this->contexto(p75_ventas: 100, p75_vistas: 500);
        $tempEnGrande = $this->service->calcularTemperatura($m, $ctxGrande);

        $this->assertGreaterThan($tempEnGrande, $tempEnChico);
    }

    // ─────────────────────────────────────────────────────────────────
    // SCORE
    // ─────────────────────────────────────────────────────────────────

    public function test_score_usa_percentil_en_catalogo_grande(): void
    {
        $m = $this->metricsConVentas(ventas_7d: 10, vistas_7d: 100, ventas_total: 200, vistas_30d: 500);
        // Catálogo grande con 30 scores ordenados: este producto ~70 de score_raw
        $scoresOrdenados = range(0, 145, 5); // 30 elementos [0,5,...,145]
        $ctx = new Contexto(
            p75_ventas_7d: 10,
            p75_vistas_7d: 100,
            scores_raw: $scoresOrdenados,
            catalogo_pequeno: false,
        );

        $tendencia = $this->service->calcularTendencia([10, 8, 8, 8, 8, 8, 8, 8]);
        $score = $this->service->calcularScore($m, $ctx, $tendencia);

        // Score percentil debe estar entre 0 y 100
        $this->assertGreaterThanOrEqual(0, $score);
        $this->assertLessThanOrEqual(100, $score);
    }

    public function test_score_fallback_escalado_en_catalogo_pequeno(): void
    {
        $m = $this->metricsConVentas(ventas_7d: 5, vistas_7d: 50, ventas_total: 100, vistas_30d: 200);
        $ctx = new Contexto(
            p75_ventas_7d: 5,
            p75_vistas_7d: 50,
            scores_raw: [10, 50, 80],   // 3 productos
            catalogo_pequeno: true,
        );

        $tendencia = $this->service->calcularTendencia([5, 5, 5, 5, 5, 5, 5, 5]);
        $score = $this->service->calcularScore($m, $ctx, $tendencia);

        $this->assertGreaterThanOrEqual(0, $score);
        $this->assertLessThanOrEqual(100, $score);
    }

    // ─────────────────────────────────────────────────────────────────
    // SEÑALES (en orden de prioridad)
    // ─────────────────────────────────────────────────────────────────

    public function test_senal_zombie_para_producto_viejo_sin_ventas(): void
    {
        $m = $this->metricsConVentas(
            ventas_7d: 0, vistas_7d: 2,
            created_at: Carbon::now()->subDays(120),
        );

        $senal = $this->service->detectarSenal($m, $this->contexto(), $this->tendenciaSinDato());

        $this->assertSame(ProductoSenal::Zombie, $senal);
    }

    public function test_senal_pitch_flojo_para_mucho_trafico_y_baja_conversion(): void
    {
        $m = $this->metricsConVentas(ventas_7d: 0, vistas_7d: 500);

        $senal = $this->service->detectarSenal($m, $this->contexto(), $this->tendenciaSinDato());

        $this->assertSame(ProductoSenal::PitchFlojo, $senal);
    }

    public function test_senal_sin_trafico_para_producto_con_dias_sin_vistas(): void
    {
        $m = $this->metricsConVentas(
            ventas_7d: 0, vistas_7d: 2,
            created_at: Carbon::now()->subDays(15),  // 15 días: ya pasó la ventana de Lanzamiento
        );

        $senal = $this->service->detectarSenal($m, $this->contexto(), $this->tendenciaSinDato());

        $this->assertSame(ProductoSenal::SinTrafico, $senal);
    }

    public function test_senal_lanzamiento_para_producto_nuevo_convirtiendo(): void
    {
        $m = $this->metricsConVentas(
            ventas_7d: 5, vistas_7d: 100,   // 5% conversion
            created_at: Carbon::now()->subDays(10),
        );

        $senal = $this->service->detectarSenal($m, $this->contexto(), $this->tendenciaSinDato());

        $this->assertSame(ProductoSenal::Lanzamiento, $senal);
    }

    public function test_senal_trending_cuando_z_score_alto(): void
    {
        $m = $this->metricsConVentas(
            ventas_7d: 20, vistas_7d: 100,
            created_at: Carbon::now()->subDays(60),  // no es lanzamiento
        );
        $tendencia = $this->service->calcularTendencia([20, 5, 5, 5, 5, 5, 5, 5]);

        $senal = $this->service->detectarSenal($m, $this->contexto(p75_ventas: 100), $tendencia);

        $this->assertSame(ProductoSenal::Trending, $senal);
    }

    public function test_senal_caballo_para_top_estable_no_bajando(): void
    {
        $m = $this->metricsConVentas(
            ventas_7d: 30, vistas_7d: 200,
            created_at: Carbon::now()->subDays(180),
        );
        // Tendencia neutral, no down
        $tendencia = $this->service->calcularTendencia([10, 10, 10, 10, 10, 10, 10, 10]);

        $senal = $this->service->detectarSenal($m, $this->contexto(p75_ventas: 10), $tendencia);

        $this->assertSame(ProductoSenal::Caballo, $senal);
    }

    public function test_senal_null_para_producto_promedio_sin_patron(): void
    {
        $m = $this->metricsConVentas(
            ventas_7d: 3, vistas_7d: 20,
            created_at: Carbon::now()->subDays(90),
        );
        $tendencia = $this->service->calcularTendencia([3, 3, 3, 3, 3, 3, 3, 3]);

        $senal = $this->service->detectarSenal($m, $this->contexto(p75_ventas: 10), $tendencia);

        $this->assertNull($senal);
    }

    public function test_orden_prioridad_zombie_gana_sobre_sin_trafico(): void
    {
        // Producto sin ventas, sin vistas, muy viejo — matchea Zombie y Sin tráfico
        $m = $this->metricsConVentas(
            ventas_7d: 0, vistas_7d: 1,
            created_at: Carbon::now()->subDays(120),
        );

        $senal = $this->service->detectarSenal($m, $this->contexto(), $this->tendenciaSinDato());

        $this->assertSame(ProductoSenal::Zombie, $senal);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function metricsConVentas(
        int $ventas_7d,
        int $vistas_7d,
        int $vistas_30d = 0,
        int $ventas_total = 0,
        ?Carbon $created_at = null,
        array $series_8w = [0, 0, 0, 0, 0, 0, 0, 0],
    ): ProductoMetrics {
        return new ProductoMetrics(
            ventas_7d:    $ventas_7d,
            vistas_7d:    $vistas_7d,
            vistas_30d:   $vistas_30d ?: $vistas_7d * 4,
            ventas_total: $ventas_total ?: $ventas_7d * 10,
            created_at:   $created_at ?? Carbon::now()->subDays(90),
            series_8w:    $series_8w,
        );
    }

    private function contexto(int $p75_ventas = 10, int $p75_vistas = 100): Contexto
    {
        return new Contexto(
            p75_ventas_7d:    $p75_ventas,
            p75_vistas_7d:    $p75_vistas,
            scores_raw:       [],
            catalogo_pequeno: false,
        );
    }

    private function tendenciaSinDato(): \App\Support\Producto\Tendencia
    {
        return \App\Support\Producto\Tendencia::sinDato();
    }
}
