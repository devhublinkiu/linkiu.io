<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Productos\EliminarProducto;
use App\Actions\Productos\SaveProductoInfo;
use App\Actions\Productos\SaveProductoPrecio;
use App\Actions\Productos\SyncProductoCantidades;
use App\Enums\LinkiuHook;
use App\Http\Controllers\Controller;
use App\Http\Requests\Productos\StoreProductoInfoRequest;
use App\Http\Requests\Productos\UpdateProductoPrecioRequest;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Producto;
use App\Support\Producto\SnapshotsRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductosController extends Controller
{
    public function index(Request $request, SnapshotsRepository $snapshots)
    {
        abort_if(! auth()->user()->can('productos.ver'), 403);

        $busqueda = (string) $request->input('busqueda', '');
        $filtro   = (string) $request->input('filtro', '');

        // Solo `vendidos_total` se calcula aquí porque alimenta una columna
        // independiente de performance. Los agregados de temperatura/score
        // los provee el SnapshotsRepository (cacheado 1h).
        $vendidosTotal = OrderItem::selectRaw('COALESCE(SUM(cantidad), 0)')
            ->whereColumn('producto_id', 'productos.id');

        $query = Producto::with(['imagenPrincipal', 'categoria', 'hooks' => fn ($q) => $q->where('activo', true)])
            ->addSelect(['vendidos_total' => $vendidosTotal])
            ->orderByDesc('created_at');

        if ($busqueda) {
            $query->where(function ($q) use ($busqueda) {
                $q->where('nombre', 'like', "%{$busqueda}%")
                  ->orWhere('sku', 'like', "%{$busqueda}%");
            });
        }

        if ($filtro && $filtro !== 'todos') {
            $query->where('status', $filtro);
        }

        $snapshotsPorId = $snapshots->todos();

        // Snapshot vacío para productos en borrador (no entran al catálogo
        // activo del repository) — el frontend espera el shape igual.
        $snapshotVacio = $this->snapshotVacio();

        $productos = $query->paginate(20)->through(function ($p) use ($snapshotsPorId, $snapshotVacio) {
            $snap = $snapshotsPorId[$p->id] ?? $snapshotVacio;

            return [
                'id'              => $p->id,
                'nombre'          => $p->nombre,
                'slug'            => $p->slug,
                'sku'             => $p->sku,
                'status'          => $p->status,
                'precio_base'     => $p->precio_base,
                'imagen'          => $p->imagenPrincipal?->url,
                'hooks_activos'   => $p->hooks->count(),
                'categoria'       => $p->categoria?->name,
                'vendidos'        => (int) ($p->vendidos_total ?? 0),
                'ventas_7d'       => $snap['debug']['ventas_7d'],
                'vistas_7d'       => $snap['debug']['vistas_7d'],
                'scroll_promedio' => $snap['debug']['scroll_promedio'],
                'temperatura'     => $snap['temperatura'],
                'tendencia'       => [
                    'direccion' => $snap['tendencia']['direccion'] === 'sin_dato'
                        ? 'neutral'
                        : $snap['tendencia']['direccion'],
                    'pct'       => $snap['tendencia']['pct'],
                ],
                'score'           => $snap['score'],
                'senal'           => $snap['senal'],
                'performance_debug' => $snap['debug'],
            ];
        });

        return Inertia::render('admin/productos/Index', [
            'productos' => $productos,
            'filtros'   => ['busqueda' => $busqueda, 'filtro' => $filtro ?: 'todos'],
        ]);
    }

    /**
     * Producto en borrador o recién creado (antes de regenerar cache)
     * no aparece en el snapshot del catálogo activo. Le damos un shape
     * con valores neutros para que el frontend no rompa.
     */
    private function snapshotVacio(): array
    {
        return [
            'score'       => 0,
            'temperatura' => 0,
            'tendencia'   => ['direccion' => 'neutral', 'pct' => 0],
            'senal'       => null,
            'debug'       => [
                'ventas_7d'       => 0,
                'vistas_7d'       => 0,
                'vistas_30d'      => 0,
                'ventas_total'    => 0,
                'scroll_promedio' => 0,
                'conversion_rate' => 0,
                'p75_ventas_7d'   => 0,
                'p75_vistas_7d'   => 0,
                'dias_creacion'   => 0,
                'catalogo_pequeno' => true,
            ],
        ];
    }

    public function create()
    {
        return Inertia::render('admin/productos/Create', [
            'categorias' => $this->categoriasParaSelect(),
        ]);
    }

    public function store(StoreProductoInfoRequest $request, SaveProductoInfo $action)
    {
        $producto = $action->execute($request->validated());

        return redirect()
            ->route('admin.productos.edit', $producto)
            ->with('status', 'Información guardada correctamente.');
    }

    public function edit(Producto $producto)
    {
        $producto->load(['cantidades', 'imagenes', 'variableGrupos.items', 'hooks']);

        return Inertia::render('admin/productos/Edit', [
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

        return back()->with('status', 'Información actualizada correctamente.');
    }

    public function updatePrecio(UpdateProductoPrecioRequest $request, Producto $producto, SaveProductoPrecio $precioAction, SyncProductoCantidades $cantidadesAction)
    {
        $datos = $request->validated();
        $precioAction->execute($datos, $producto);
        $cantidadesAction->execute($datos['cantidades'] ?? [], $producto);

        return back()->with('status', 'Precio actualizado.');
    }

    public function destroy(Producto $producto, EliminarProducto $action)
    {
        $action->execute($producto);

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
