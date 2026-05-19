<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Productos\SaveProductoInfo;
use App\Actions\Productos\SaveProductoPrecio;
use App\Actions\Productos\SyncProductoCantidades;
use App\Enums\LinkiuHook;
use App\Http\Controllers\Controller;
use App\Http\Requests\Productos\StoreProductoInfoRequest;
use App\Http\Requests\Productos\UpdateProductoPrecioRequest;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\ProductView;
use App\Models\Producto;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductosController extends Controller
{
    public function index()
    {
        $hoy      = Carbon::today();
        $hace7    = $hoy->copy()->subDays(7);
        $hace14   = $hoy->copy()->subDays(14);

        // Subquery: total vendidos (todos los tiempos)
        $vendidosTotal = OrderItem::selectRaw('SUM(cantidad)')
            ->whereColumn('producto_id', 'productos.id');

        // Subquery: vendidos Ãºltimos 7 dÃ­as
        $vendidos7d = OrderItem::selectRaw('COALESCE(SUM(cantidad), 0)')
            ->whereColumn('producto_id', 'productos.id')
            ->where('created_at', '>=', $hace7);

        // Subquery: vendidos semana anterior (dÃ­as 8-14)
        $vendidos7dAnterior = OrderItem::selectRaw('COALESCE(SUM(cantidad), 0)')
            ->whereColumn('producto_id', 'productos.id')
            ->whereBetween('created_at', [$hace14, $hace7]);

        // Subquery: vistas Ãºltimos 7 dÃ­as
        $vistas7d = ProductView::selectRaw('COALESCE(SUM(visitas), 0)')
            ->whereColumn('producto_id', 'productos.id')
            ->where('fecha', '>=', $hace7);

        // Subquery: scroll promedio Ãºltimos 7 dÃ­as
        $scrollPromedio = ProductView::selectRaw(
            'CASE WHEN SUM(scroll_depth_count) > 0 THEN ROUND(SUM(scroll_depth_sum) * 1.0 / SUM(scroll_depth_count)) ELSE 0 END'
        )
            ->whereColumn('producto_id', 'productos.id')
            ->where('fecha', '>=', $hace7);

        $productos = Producto::with(['imagenPrincipal', 'categoria', 'hooks' => fn ($q) => $q->where('activo', true)])
            ->addSelect([
                'vendidos_total'       => $vendidosTotal,
                'ventas_7d'            => $vendidos7d,
                'ventas_7d_anterior'   => $vendidos7dAnterior,
                'vistas_7d'            => $vistas7d,
                'scroll_promedio'      => $scrollPromedio,
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($p) => [
                'id'            => $p->id,
                'nombre'        => $p->nombre,
                'slug'          => $p->slug,
                'sku'           => $p->sku,
                'status'        => $p->status,
                'precio_base'   => $p->precio_base,
                'imagen'        => $p->imagenPrincipal?->url,
                'hooks_activos' => $p->hooks->count(),
                'categoria'     => $p->categoria?->name,
                'vendidos'       => (int) ($p->vendidos_total ?? 0),
                'ventas_7d'      => (int) ($p->ventas_7d ?? 0),
                'vistas_7d'      => (int) ($p->vistas_7d ?? 0),
                'scroll_promedio'=> (int) ($p->scroll_promedio ?? 0),
                'temperatura'    => $this->calcularTemperatura(
                    (int) ($p->ventas_7d ?? 0),
                    (int) ($p->vistas_7d ?? 0),
                    (int) ($p->scroll_promedio ?? 0),
                ),
                'tendencia'      => $this->calcularTendencia(
                    (int) ($p->ventas_7d ?? 0),
                    (int) ($p->ventas_7d_anterior ?? 0),
                ),
            ]);

        return Inertia::render('admin/productos/Index', compact('productos'));
    }

    private function calcularTemperatura(int $ventas7d, int $vistas7d, int $scrollPromedio): int
    {
        $ventasScore = min($ventas7d / 20, 1.0) * 100;
        $vistasScore = min($vistas7d / 200, 1.0) * 100;

        return (int) round($ventasScore * 0.5 + $vistasScore * 0.3 + $scrollPromedio * 0.2);
    }

    private function calcularTendencia(int $ventas7d, int $ventas7dAnterior): array
    {
        if ($ventas7dAnterior === 0 && $ventas7d === 0) {
            return ['direccion' => 'neutral', 'pct' => 0];
        }
        if ($ventas7dAnterior === 0) {
            return ['direccion' => 'up', 'pct' => 100];
        }

        $pct = round((($ventas7d - $ventas7dAnterior) / $ventas7dAnterior) * 100);

        return [
            'direccion' => $pct > 0 ? 'up' : ($pct < 0 ? 'down' : 'neutral'),
            'pct'       => abs($pct),
        ];
    }

    public function create()
    {
        return Inertia::render('admin/productos/create', [
            'categorias' => $this->categoriasParaSelect(),
        ]);
    }

    public function store(StoreProductoInfoRequest $request, SaveProductoInfo $action)
    {
        $producto = $action->execute($request->validated());

        return redirect()
            ->route('admin.productos.edit', $producto)
            ->with('status', 'InformaciÃ³n guardada correctamente.');
    }

    public function edit(Producto $producto)
    {
        $producto->load(['cantidades', 'imagenes', 'variableGrupos.items', 'hooks']);

        return Inertia::render('admin/productos/edit', [
            'producto'   => [
                'id'             => $producto->id,
                'nombre'         => $producto->nombre,
                'slug'           => $producto->slug,
                'descripcion'    => $producto->descripcion,
                'category_id'    => $producto->category_id,
                'sku'            => $producto->sku,
                'status'         => $producto->status,
                'precio_base'        => $producto->precio_base,
                'precio_comparacion' => $producto->precio_comparacion,
                'aplica_iva'         => $producto->aplica_iva,
                'iva_porcentaje' => $producto->iva_porcentaje,
                'cantidades'     => $producto->cantidades->map(fn ($c) => [
                    'id'            => $c->id,
                    'imagen'        => $c->imagen,
                    'cantidad'      => $c->cantidad,
                    'precio_bundle' => $c->precio_bundle,
                    'badge_texto'   => $c->badge_texto,
                    'destacado'     => $c->destacado,
                    'orden'         => $c->orden,
                ])->toArray(),
                'imagenes'       => $producto->imagenes->map(fn ($img) => [
                    'id'        => $img->id,
                    'url'       => $img->url,
                    'principal' => $img->principal,
                    'orden'     => $img->orden,
                ])->toArray(),
                'grupos'         => $producto->variableGrupos->map(fn ($g) => [
                    'id'     => $g->id,
                    'nombre' => $g->nombre,
                    'tipo'   => $g->tipo,
                    'orden'  => $g->orden,
                    'items'  => $g->items->map(fn ($i) => [
                        'id'            => $i->id,
                        'nombre'        => $i->nombre,
                        'valor'         => $i->valor,
                        'url'           => $i->url,
                        'precio_ajuste' => $i->precio_ajuste,
                        'activo'        => $i->activo,
                        'orden'         => $i->orden,
                    ])->toArray(),
                ])->toArray(),
                'hooks'        => $producto->hooks->map(fn ($h) => [
                    'key'    => $h->hook_key,
                    'activo' => $h->activo,
                    'config' => $h->config,
                ])->toArray(),
                'layout_orden' => $producto->layout_orden,
            ],
            'catalogo_hooks' => LinkiuHook::catalogo(),
            'categorias'     => $this->categoriasParaSelect(),
        ]);
    }

    public function updateInfo(StoreProductoInfoRequest $request, Producto $producto, SaveProductoInfo $action)
    {
        $action->execute($request->validated(), $producto);

        return back()->with('status', 'InformaciÃ³n actualizada correctamente.');
    }

    public function updatePrecio(UpdateProductoPrecioRequest $request, Producto $producto, SaveProductoPrecio $precioAction, SyncProductoCantidades $cantidadesAction)
    {
        $datos = $request->validated();
        $precioAction->execute($datos, $producto);
        $cantidadesAction->execute($datos['cantidades'] ?? [], $producto);

        return back()->with('status', 'Precio actualizado.');
    }

    public function destroy(Producto $producto)
    {
        $producto->delete();

        return redirect()->route('admin.productos.index')->with('status', 'Producto eliminado.');
    }

    private function categoriasParaSelect(): array
    {
        return Category::where('status', 'activo')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])
            ->toArray();
    }
}
