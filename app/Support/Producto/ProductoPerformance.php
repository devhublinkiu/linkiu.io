<?php

namespace App\Support\Producto;

use App\Enums\ProductoSenal;

/**
 * Calcula las 4 métricas de performance (Score, Temperatura, Tendencia,
 * Señal) a partir de `ProductoMetrics` + `Contexto` del catálogo.
 *
 * Es 100% puro: no toca BD, no cachea, no tiene side effects. La
 * orquestación (queries, cache, invalidación) vive en otra capa.
 */
class ProductoPerformance
{
    /**
     * Catálogo se considera pequeño si tiene <20 productos activos.
     * Por debajo de eso, percentiles dan saltos de 5+ puntos y el Score
     * pierde resolución — mejor usar score_raw escalado.
     */
    public const MIN_CATALOG_FOR_PERCENTIL = 20;

    /**
     * Calcula el snapshot completo de un producto.
     */
    public function snapshot(ProductoMetrics $m, Contexto $ctx): Snapshot
    {
        $tendencia      = $this->calcularTendencia($m->series_8w);
        $score          = $this->calcularScore($m, $ctx, $tendencia);
        $temperatura    = $this->calcularTemperatura($m, $ctx);
        $senal          = $this->detectarSenal($m, $ctx, $tendencia);

        return new Snapshot(
            score:       $score,
            temperatura: $temperatura,
            tendencia:   $tendencia,
            senal:       $senal,
            debug:       [
                'ventas_7d'        => $m->ventas_7d,
                'vistas_7d'        => $m->vistas_7d,
                'vistas_30d'       => $m->vistas_30d,
                'ventas_total'     => $m->ventas_total,
                'scroll_promedio'  => $m->scroll_promedio,
                'conversion_rate'  => round($m->conversionRate(), 4),
                'p75_ventas_7d'    => $ctx->p75_ventas_7d,
                'p75_vistas_7d'    => $ctx->p75_vistas_7d,
                'dias_creacion'    => $m->diasDesdeCreacion(),
                'catalogo_pequeno' => $ctx->catalogo_pequeno,
            ],
        );
    }

    /**
     * Score crudo (sin percentil) compuesto por las 4 dimensiones.
     * Es lo que el ContextoCalculator usa para construir el ranking
     * del catálogo. El score final que ve el usuario es el percentil
     * de este score_raw dentro del catálogo.
     */
    public function calcularScoreRaw(ProductoMetrics $m, Tendencia $tendencia): float
    {
        $conversion = $m->conversionRate() * 40;                     // peso 40 (max ~40)
        $volumen    = log(1 + $m->ventas_total) * 25;                // peso 25 suavizado
        $trafico    = log(1 + $m->vistas_30d) * 15;                  // peso 15 suavizado
        $momentum   = $this->normalizar(-1, 1, $tendencia->z_score / 2) * 20;

        return $conversion + $volumen + $trafico + $momentum;
    }

    /**
     * Score final 0-100: percentil del score_raw en el catálogo, o
     * score_raw escalado si el catálogo es pequeño (<20 productos),
     * donde el percentil daría saltos abruptos.
     */
    public function calcularScore(ProductoMetrics $m, Contexto $ctx, Tendencia $tendencia): int
    {
        $scoreRaw = $this->calcularScoreRaw($m, $tendencia);

        if ($ctx->catalogo_pequeno) {
            // Max teórico de scoreRaw ronda ~140 en producto top
            return (int) max(0, min(100, round($scoreRaw / 1.4)));
        }

        return $ctx->percentilDe($scoreRaw);
    }

    /**
     * Temperatura 0-100 absoluta calibrada al p75 del catálogo.
     * Reemplaza las constantes mágicas (20 ventas/200 vistas) por
     * umbrales adaptativos que se ajustan al volumen real del negocio.
     */
    public function calcularTemperatura(ProductoMetrics $m, Contexto $ctx): int
    {
        $ventasScore     = min($m->ventas_7d / max($ctx->p75_ventas_7d, 1), 1.0) * 100;
        $vistasScore     = min($m->vistas_7d / max($ctx->p75_vistas_7d, 1), 1.0) * 100;
        $conversionScore = min($m->conversionRate() * 1000, 100);   // 10% conversion = 100

        return (int) round(
            $ventasScore * 0.50 + $vistasScore * 0.25 + $conversionScore * 0.25,
        );
    }

    /**
     * Tendencia por z-score sobre baseline de 4 semanas previas.
     * Devuelve `sinDato()` si volumen total <8 ventas en 8 semanas
     * (= menos de 1/sem en promedio): ahí cualquier % es ruido.
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
        $std           = $this->desviacionEstandar($series);

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
     */
    public function detectarSenal(ProductoMetrics $m, Contexto $ctx, Tendencia $tendencia): ?ProductoSenal
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

        // 6. Caballo — top performer estable
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

    private function normalizar(float $min, float $max, float $valor): float
    {
        $clamped = max($min, min($max, $valor));
        return ($clamped - $min) / ($max - $min);
    }
}
