<?php

namespace App\Support\Producto;

use App\Models\OrderItem;
use App\Models\Producto;
use App\Models\ProductView;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * Orquesta el cálculo del snapshot de performance para TODOS los
 * productos del catálogo activo. Cachea el resultado completo bajo una
 * sola key (`productos:performance_snapshots`) por 1 hora.
 *
 * Por qué una sola key vs key por producto: el contexto del catálogo
 * (p75 + scores raw) depende del catálogo entero, así que invalidar 1
 * producto obliga a recalcular el contexto. Es más simple invalidar
 * todo y recalcular con 2-3 queries que mantener consistencia parcial.
 */
class SnapshotsRepository
{
    public const CACHE_KEY = 'productos:performance_snapshots';
    public const CACHE_TTL = 3600;  // 1 hora

    public function __construct(
        private readonly ProductoPerformance $performance,
        private readonly ContextoCalculator $contextoCalculator,
        private readonly CalcularSeriesSemanal $seriesCalculator,
    ) {}

    /**
     * Retorna `[producto_id => snapshot_array]` para todos los productos
     * activos. Snapshot ya serializado (toArray) para ser cache-friendly
     * y consumible directo por Inertia sin reconstruir objetos.
     */
    public function todos(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, fn () => $this->calcular());
    }

    /**
     * Para un producto puntual. Devuelve null si no hay snapshot
     * (producto recién creado antes de regenerar cache).
     */
    public function paraProducto(int $productoId): ?array
    {
        return $this->todos()[$productoId] ?? null;
    }

    public static function invalidar(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    private function calcular(): array
    {
        $ahora  = Carbon::now();
        $hace7  = $ahora->copy()->subDays(7);
        $hace30 = $ahora->copy()->subDays(30);

        // 1 query: agregados por producto. Sub-queries correlacionadas
        // para que cada agregado sea independiente y MySQL los optimice
        // junto al SELECT principal.
        $productos = Producto::query()
            ->where('status', 'activo')
            ->select('id', 'created_at')
            ->addSelect([
                'ventas_7d' => OrderItem::selectRaw('COALESCE(SUM(cantidad), 0)')
                    ->whereColumn('producto_id', 'productos.id')
                    ->where('created_at', '>=', $hace7),
                'vistas_7d' => ProductView::selectRaw('COALESCE(SUM(visitas), 0)')
                    ->whereColumn('producto_id', 'productos.id')
                    ->where('fecha', '>=', $hace7->toDateString()),
                'vistas_30d' => ProductView::selectRaw('COALESCE(SUM(visitas), 0)')
                    ->whereColumn('producto_id', 'productos.id')
                    ->where('fecha', '>=', $hace30->toDateString()),
                'ventas_total' => OrderItem::selectRaw('COALESCE(SUM(cantidad), 0)')
                    ->whereColumn('producto_id', 'productos.id'),
                'scroll_promedio' => ProductView::selectRaw(
                    'CASE WHEN SUM(scroll_depth_count) > 0 THEN ROUND(SUM(scroll_depth_sum) * 1.0 / SUM(scroll_depth_count)) ELSE 0 END'
                )
                    ->whereColumn('producto_id', 'productos.id')
                    ->where('fecha', '>=', $hace7->toDateString()),
            ])
            ->get();

        // 1 query: series 8 semanas
        $todasLasSeries = $this->seriesCalculator->ejecutar();

        // Convertir a ProductoMetrics
        $metricas = $productos->map(fn ($p) => new ProductoMetrics(
            ventas_7d:       (int) $p->ventas_7d,
            vistas_7d:       (int) $p->vistas_7d,
            vistas_30d:      (int) $p->vistas_30d,
            ventas_total:    (int) $p->ventas_total,
            created_at:      $p->created_at,
            series_8w:       $todasLasSeries[$p->id] ?? array_fill(0, 8, 0),
            scroll_promedio: (int) $p->scroll_promedio,
        ));

        // Pass 1: construir Contexto
        $contexto = $this->contextoCalculator->calcular($metricas->all());

        // Pass 2: snapshot por producto
        $snapshots = [];
        foreach ($productos as $i => $p) {
            $snapshots[$p->id] = $this->performance
                ->snapshot($metricas[$i], $contexto)
                ->toArray();
        }

        return $snapshots;
    }
}
