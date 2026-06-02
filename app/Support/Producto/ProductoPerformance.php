<?php

namespace App\Support\Producto;

use App\Enums\ProductoSenal;

/**
 * Calcula las 4 métricas de performance (Score, Temperatura, Tendencia,
 * Señal) a partir de `ProductoMetrics` + `Contexto` del catálogo.
 *
 * Diseno ortogonal — cada metrica mide UNA dimension distinta:
 *
 *   Score:       calidad del pitch (conversion rate vs catalogo).
 *   Temperatura: demanda absoluta actual (ventas + vistas vs p75).
 *   Tendencia:   momentum (z-score de ventas vs baseline).
 *   Senal:       diagnostico cualitativo combinando las 3.
 *
 * Es 100% puro: no toca BD, no cachea, no tiene side effects.
 */
class ProductoPerformance
{
    /**
     * Vistas 7d minimas para que conversion sea estadisticamente confiable.
     * Debajo de eso, Score se reporta como null (Sin data).
     */
    public const UMBRAL_VISTAS_CONFIABLE = 50;

    /**
     * Minimo de productos CONFIABLES en el catalogo para que el percentil
     * tenga resolucion. Debajo de eso, el percentil pega saltos abruptos.
     */
    public const MIN_CATALOG_FOR_PERCENTIL = 20;

    /**
     * Calcula el snapshot completo de un producto.
     */
    public function snapshot(ProductoMetrics $m, Contexto $ctx): Snapshot
    {
        $tendencia     = $this->calcularTendencia($m->series_8w);
        $score         = $this->calcularScore($m, $ctx);
        $conversionPct = $m->vistas_7d >= self::UMBRAL_VISTAS_CONFIABLE
            ? round($m->conversionRate() * 100, 1)
            : null;
        $temperatura   = $this->calcularTemperatura($m, $ctx);
        $valor         = $this->calcularValor($m, $ctx);
        $senal         = $this->detectarSenal($m, $ctx, $tendencia, $score);

        return new Snapshot(
            score:          $score,
            conversion_pct: $conversionPct,
            temperatura:    $temperatura,
            valor:          $valor,
            revenue_7d:     $m->revenue_7d,
            tendencia:      $tendencia,
            senal:          $senal,
            debug:       [
                'ventas_7d'        => $m->ventas_7d,
                'vistas_7d'        => $m->vistas_7d,
                'vistas_30d'       => $m->vistas_30d,
                'ventas_total'     => $m->ventas_total,
                'scroll_promedio'  => $m->scroll_promedio,
                'conversion_rate'  => round($m->conversionRate(), 4),
                'revenue_7d'       => $m->revenue_7d,
                'p75_ventas_7d'    => $ctx->p75_ventas_7d,
                'p75_vistas_7d'    => $ctx->p75_vistas_7d,
                'dias_creacion'    => $m->diasDesdeCreacion(),
                'catalogo_pequeno' => $ctx->catalogo_pequeno,
            ],
        );
    }

    /**
     * Valor 0-100 = percentil del revenue_7d del producto dentro del
     * catalogo de productos que vendieron. Mide cuanto $$$ genera vs el
     * resto, dimension distinta a "cuantas unidades" (Temperatura) y
     * "que tan bien convierte" (Score).
     *
     * Devuelve null si revenue_7d = 0 (sin ventas no hay nada que comparar).
     */
    public function calcularValor(ProductoMetrics $m, Contexto $ctx): ?int
    {
        if ($m->revenue_7d === 0) {
            return null;
        }
        return $ctx->percentilDeRevenue($m->revenue_7d);
    }

    /**
     * Score = percentil de la conversion rate del producto dentro del
     * catalogo de productos con data confiable. Mide SOLO calidad del
     * pitch — que tan bien convierte cuando alguien lo ve.
     *
     * Devuelve null si vistas_7d < UMBRAL (no hay data suficiente). El
     * frontend muestra "—" en lugar de un 0 enganoso.
     */
    public function calcularScore(ProductoMetrics $m, Contexto $ctx): ?int
    {
        if ($m->vistas_7d < self::UMBRAL_VISTAS_CONFIABLE) {
            return null;
        }
        return $ctx->percentilDeConversion($m->conversionRate());
    }

    /**
     * Temperatura 0-100 = demanda actual del producto, calibrada al p75
     * del catalogo. Mide SOLO volumen (ventas + vistas), sin tocar
     * conversion (eso lo mide Score). Dos productos con mismas ventas
     * pero distinta conversion van a tener misma Temperatura — correcto.
     *
     * Mezcla 66% ventas / 34% vistas: ventas son la senal real (intencion
     * + completado), vistas son interes (intencion sola).
     */
    public function calcularTemperatura(ProductoMetrics $m, Contexto $ctx): int
    {
        $ventasScore = min($m->ventas_7d / max($ctx->p75_ventas_7d, 1), 1.0) * 100;
        $vistasScore = min($m->vistas_7d / max($ctx->p75_vistas_7d, 1), 1.0) * 100;

        return (int) round($ventasScore * 0.66 + $vistasScore * 0.34);
    }

    /**
     * Tendencia por z-score sobre baseline de 4 semanas previas.
     * Devuelve `sinDato()` si volumen total <8 ventas en 8 semanas
     * (= menos de 1/sem en promedio): ahí cualquier % es ruido.
     *
     * Std calculada SOLO sobre la baseline (semanas -1 a -4), no sobre
     * las 8 semanas completas. Incluir la semana actual en la std
     * "auto-absorbe" la anomalia que justamente queremos detectar.
     */
    public function calcularTendencia(array $series_8w): Tendencia
    {
        // Padding defensivo si llegan menos de 8 semanas
        $series = array_pad($series_8w, 8, 0);
        $series = array_slice($series, 0, 8);

        $total = array_sum($series);
        if ($total < 8) {
            return Tendencia::sinDato();
        }

        $ventasActual    = (int) $series[0];
        $baselineSemanas = array_slice($series, 1, 4);  // semanas -1 a -4

        $baselineMedia = array_sum($baselineSemanas) / count($baselineSemanas);
        $std           = $this->desviacionEstandar($baselineSemanas);

        $z   = $std > 0 ? ($ventasActual - $baselineMedia) / $std : 0;
        $pct = $baselineMedia > 0
            ? (int) round((($ventasActual - $baselineMedia) / $baselineMedia) * 100)
            : ($ventasActual > 0 ? 99 : 0);

        // Requiere significancia EN AMBAS dimensiones: estadística (z>0.5)
        // Y magnitud (|pct|>=15). Evita falsos positivos cuando la baseline
        // es muy constante y un blip de 1 unidad dispara z alto pero el
        // cambio real es trivial.
        $significativo = abs($z) > 0.5 && abs($pct) >= 15;
        $direccion = ! $significativo ? 'neutral' : ($z > 0 ? 'up' : 'down');
        $displayPct = max(-99, min(99, abs($pct)));

        return new Tendencia(
            direccion:                $direccion,
            pct:                      $displayPct,
            z_score:                  round($z, 2),
            tiene_senal:              true,
            ventas_actual:            $ventasActual,
            ventas_baseline_promedio: (int) round($baselineMedia),
        );
    }

    /**
     * Detecta una señal cualitativa. Evaluación en orden de prioridad:
     * el primer caso que matchee es el que retorna (mutuamente excluyentes
     * en presentación).
     *
     * $score puede ser null (sin data). Las ramas que dependen de Score
     * se omiten en ese caso.
     */
    public function detectarSenal(ProductoMetrics $m, Contexto $ctx, Tendencia $tendencia, ?int $score): ?ProductoSenal
    {
        $dias       = $m->diasDesdeCreacion();
        $conversion = $m->conversionRate();

        // 1. Zombie — sin ventas largo tiempo + casi sin visitas
        if ($m->ventas_7d === 0 && $dias > 60 && $m->vistas_7d < 5) {
            return ProductoSenal::Zombie;
        }

        // 2. Pitch flojo — mucho tráfico, casi cero conversión
        if ($m->vistas_7d > 50 && $conversion < 0.01) {
            return ProductoSenal::PitchFlojo;
        }

        // 3. Sin tráfico — producto con cierta edad pero nadie lo ve
        if ($m->vistas_7d < 5 && $dias > 7) {
            return ProductoSenal::SinTrafico;
        }

        // 4. Lanzamiento — producto nuevo convirtiendo bien
        if ($dias <= 30 && $m->ventas_7d > 0 && $conversion > 0.02) {
            return ProductoSenal::Lanzamiento;
        }

        // 5. Trending — ventas creciendo con significancia estadística
        if ($tendencia->direccion === 'up' && $tendencia->z_score > 1.0) {
            return ProductoSenal::Trending;
        }

        // 6. Caballo — top performer estable (top en ventas + no esta cayendo)
        if ($m->ventas_7d > $ctx->p75_ventas_7d && $tendencia->direccion !== 'down') {
            return ProductoSenal::Caballo;
        }

        return null;
    }

    private function desviacionEstandar(array $valores): float
    {
        $n = count($valores);
        if ($n < 2) {
            return 0.0;
        }

        $media = array_sum($valores) / $n;
        $varianza = array_sum(array_map(fn ($v) => ($v - $media) ** 2, $valores)) / $n;

        return sqrt($varianza);
    }
}
