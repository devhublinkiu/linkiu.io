<?php

namespace App\Support\VistaEnVivo;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductView;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

/**
 * Recolecta los datos para el dashboard de Vista en Vivo. Sin cache —
 * el frontend hace pull cada 30s, queremos data fresca.
 *
 * Convencion: todos los metodos devuelven shapes serializables (arrays
 * planos) listos para el payload Inertia.
 */
class VistaEnVivoData
{
    private const KEY_ONLINE   = 'vivo:online';
    private const KEY_CIUDADES = 'vivo:ciudades';

    public function todo(): array
    {
        return [
            'online'       => $this->online(),
            'ventas_hoy'   => $this->ventasHoy(),
            'revenue_hoy'  => $this->revenueHoy(),
            'conversion'   => $this->conversionHoy(),
            'top_productos' => $this->top5Productos(),
            'ciudades'     => $this->ciudadesActivas(),
            'ultimas_ventas' => $this->ultimasVentas(),
        ];
    }

    /**
     * Cantidad de visitantes con heartbeat en los ultimos 60s.
     * Devuelve 0 si Redis no esta disponible (entorno local, etc.) — no
     * rompe la vista, solo no muestra presencia.
     */
    public function online(): int
    {
        try {
            $hace60s = time() - 60;
            return (int) Redis::zcount(self::KEY_ONLINE, $hace60s, '+inf');
        } catch (\Throwable $e) {
            Log::debug('VistaEnVivo::online — Redis no disponible', ['msg' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Ordenes creadas hoy (cualquier estado salvo cancelado).
     */
    public function ventasHoy(): int
    {
        return (int) Order::query()
            ->whereDate('created_at', Carbon::today())
            ->where('estado', '!=', 'cancelado')
            ->count();
    }

    public function revenueHoy(): int
    {
        return (int) Order::query()
            ->whereDate('created_at', Carbon::today())
            ->where('estado', '!=', 'cancelado')
            ->sum('total');
    }

    /**
     * Tasa de conversion del dia = ordenes / visitantes unicos del dia.
     * Visitantes unicos: SUM(visitas) de hoy en product_views.
     */
    public function conversionHoy(): float
    {
        $vistas = (int) ProductView::query()
            ->whereDate('fecha', Carbon::today())
            ->sum('visitas');

        $ventas = $this->ventasHoy();

        if ($vistas === 0) return 0.0;
        return round(($ventas / $vistas) * 100, 1);
    }

    /**
     * Top 5 productos por cantidad vendida hoy.
     */
    public function top5Productos(): array
    {
        return OrderItem::query()
            ->select('producto_id', 'producto_nombre', 'producto_imagen')
            ->selectRaw('SUM(cantidad) as total_vendidas')
            ->selectRaw('SUM(cantidad * precio_unitario) as revenue')
            ->whereHas('order', function ($q) {
                $q->whereDate('created_at', Carbon::today())
                  ->where('estado', '!=', 'cancelado');
            })
            ->whereNotNull('producto_id')
            ->groupBy('producto_id', 'producto_nombre', 'producto_imagen')
            ->orderByDesc('total_vendidas')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'producto_id'    => $row->producto_id,
                'nombre'         => $row->producto_nombre,
                'imagen'         => $row->producto_imagen,
                'total_vendidas' => (int) $row->total_vendidas,
                'revenue'        => (int) $row->revenue,
            ])
            ->toArray();
    }

    /**
     * Lista de ciudades con count, ordenado desc. Top 10.
     * Devuelve [] si Redis no esta disponible.
     */
    public function ciudadesActivas(): array
    {
        try {
            $hash = Redis::hgetall(self::KEY_CIUDADES) ?: [];

            $items = [];
            foreach ($hash as $ciudad => $count) {
                $items[] = ['ciudad' => $ciudad, 'count' => (int) $count];
            }

            usort($items, fn ($a, $b) => $b['count'] <=> $a['count']);

            return array_slice($items, 0, 10);
        } catch (\Throwable $e) {
            Log::debug('VistaEnVivo::ciudadesActivas — Redis no disponible', ['msg' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Ultimas 5 ventas del dia (no canceladas), las mas recientes primero.
     * Para el stream lateral con scroll inverso.
     */
    public function ultimasVentas(): array
    {
        return Order::query()
            ->whereDate('created_at', Carbon::today())
            ->where('estado', '!=', 'cancelado')
            ->latest()
            ->limit(5)
            ->get(['id', 'codigo', 'nombre', 'ciudad', 'total', 'created_at'])
            ->map(fn ($o) => [
                'id'         => $o->id,
                'codigo'     => $o->codigo,
                'nombre'     => $o->nombre,
                'ciudad'     => $o->ciudad,
                'total'      => (int) $o->total,
                'created_at' => $o->created_at?->toIso8601String(),
            ])
            ->toArray();
    }
}
