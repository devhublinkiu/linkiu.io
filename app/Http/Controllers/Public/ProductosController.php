<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Productos\ProductoDetalleResource;
use App\Http\Resources\Productos\ProductoPublicoResource;
use App\Models\Category;
use App\Models\Producto;
use App\Support\ProductosCache;
use Inertia\Inertia;
use Inertia\Response;

class ProductosController extends Controller
{
    /**
     * Listado completo de productos activos.
     */
    public function index(): Response
    {
        $productos = ProductosCache::listado(function () {
            return ProductoPublicoResource::collection(
                Producto::query()
                    ->where('status', 'activo')
                    ->with($this->relacionesParaCard())
                    ->withCount(['variableGrupos', 'cantidades'])
                    ->orderBy('nombre')
                    ->get()
            )->resolve();
        });

        return Inertia::render('public/Products', ['productos' => $productos]);
    }

    /**
     * Página de un producto por slug. Si no hay producto con ese slug, intenta
     * resolverlo como categoría (compatibilidad con URLs existentes).
     */
    public function show(string $slug): Response
    {
        $datos = ProductosCache::detalle($slug, function () use ($slug) {
            $producto = Producto::query()
                ->where('slug', $slug)
                ->with($this->relacionesParaDetalle())
                ->first();

            return $producto
                ? (new ProductoDetalleResource($producto))->toArray(request())
                : null;
        });

        if ($datos !== null) {
            return Inertia::render('public/Product', $datos);
        }

        return $this->renderCategoria($slug);
    }

    /**
     * Listado de productos filtrados por slug de categoría.
     */
    public function categoria(string $slug): Response
    {
        return $this->renderCategoria($slug);
    }

    private function renderCategoria(string $slug): Response
    {
        $datos = ProductosCache::categoria($slug, function () use ($slug) {
            $categoria = Category::query()
                ->where('slug', $slug)
                ->where('status', 'activo')
                ->first();

            $productos = Producto::query()
                ->where('status', 'activo')
                ->when($categoria, fn ($q) => $q->where('category_id', $categoria->id))
                ->with($this->relacionesParaCard())
                ->withCount(['variableGrupos', 'cantidades'])
                ->orderBy('nombre')
                ->get();

            return [
                'categoriaSlug' => $slug,
                'categoria'     => $categoria
                    ? [
                        'name'        => $categoria->name,
                        'slug'        => $categoria->slug,
                        'description' => $categoria->description,
                    ]
                    : null,
                'productos' => ProductoPublicoResource::collection(
                    $productos->map(fn ($p) => tap($p, fn ($pp) => $pp->setRelation('categoria', $categoria)))
                )->resolve(),
            ];
        });

        return Inertia::render('public/ProductCategory', $datos);
    }

    private function relacionesParaCard(): array
    {
        return [
            'imagenPrincipal',
            'categoria',
            'hooks' => fn ($q) => $q->where('activo', true)
                ->whereIn('hook_key', ['oferta_relampago', 'badge_producto']),
        ];
    }

    private function relacionesParaDetalle(): array
    {
        return [
            'imagenes',
            'cantidades',
            'hooks',
            'variableGrupos.items',
        ];
    }
}
