<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Order;
use App\Models\Producto;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * Stats agregadas para el dashboard admin.
 *
 * Cache compartida (no por user): los stats son los mismos para todos los
 * admins, no hay datos personales. TTL 60s — refresh rápido sin golpear la
 * BD en cada hit del dashboard (4 counts + 1 select cada minuto máximo).
 *
 * Decisiones de negocio cerradas en el #Plan del módulo:
 *  - pedidos_hoy        : count de orders creadas hoy (TODOS los estados,
 *                         refleja actividad real del día).
 *  - ingresos_hoy       : sum(total) de orders creadas hoy con estado en
 *                         [confirmado, preparando, enviado, entregado] —
 *                         excluye pendientes y canceladas (dinero realmente
 *                         por cobrar o cobrado).
 *  - clientes_total     : count total histórico (estable, sin filtros temporales).
 *  - productos_activos  : count de productos con status='activo'.
 *  - actividad_reciente : últimas 5 órdenes (cualquier estado), info mínima
 *                         para link al detalle.
 */
class DashboardStatsService
{
    private const CACHE_KEY      = 'dashboard_stats';
    private const CACHE_TTL_SECS = 60;

    /** Estados que cuentan como ingresos reales (excluye pendiente/cancelado). */
    private const ESTADOS_INGRESO = ['confirmado', 'preparando', 'enviado', 'entregado'];

    /**
     * @return array{
     *   pedidos_hoy: int,
     *   ingresos_hoy: int,
     *   clientes_total: int,
     *   productos_activos: int,
     *   actividad_reciente: array<int, array{id:int, codigo:string, total:int, estado:string, created_at:string}>
     * }
     */
    public function obtener(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL_SECS, function () {
            $hoy = Carbon::today();

            return [
                'pedidos_hoy'        => Order::whereDate('created_at', $hoy)->count(),
                'ingresos_hoy'       => (int) Order::whereDate('created_at', $hoy)
                    ->whereIn('estado', self::ESTADOS_INGRESO)
                    ->sum('total'),
                'clientes_total'     => Client::count(),
                'productos_activos'  => Producto::where('status', 'activo')->count(),
                'actividad_reciente' => Order::latest()
                    ->take(5)
                    ->get(['id', 'codigo', 'total', 'estado', 'created_at'])
                    ->map(fn (Order $o) => [
                        'id'         => $o->id,
                        'codigo'     => $o->codigo,
                        'total'      => (int) $o->total,
                        'estado'     => $o->estado,
                        'created_at' => $o->created_at->toIso8601String(),
                    ])
                    ->all(),
            ];
        });
    }

    /**
     * Invalida el cache (útil en tests o tras seeders pesados).
     */
    public function olvidar(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
