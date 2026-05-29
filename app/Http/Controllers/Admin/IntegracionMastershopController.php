<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Integraciones\UpdateMastershopConfig;
use App\Http\Controllers\Controller;
use App\Models\Integracion;
use App\Models\Producto;
use App\Services\MastershopService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Página única para la gestión Mastershop (decisión arquitectónica: por ahora
 * todo el enrolamiento se hace acá, sin sección dentro del form de Producto).
 *
 * - show:     muestra config + lista de productos Linkiu con estado vinculado/sin
 * - update:   guarda la API key (con sentinel "***" para no reescribir)
 * - probar:   testea la conexión con la key actual (o una nueva pasada en el body)
 * - buscar:   autocomplete para el modal de vinculación
 * - producto: detalle de un producto Mastershop (con variantes)
 * - vincular: persiste el vínculo producto Linkiu ↔ producto + variantes Mastershop
 * - desvincular: limpia el vínculo
 */
class IntegracionMastershopController extends Controller
{
    public function __construct(private MastershopService $mastershop) {}

    public function show(): Response
    {
        abort_if(! auth()->user()->can('integraciones.ver'), 403);

        $productos = Producto::query()
            ->with(['variableGrupos:id,producto_id,nombre,tipo,orden',
                    'variableGrupos.items:id,grupo_id,nombre,mastershop_id_variant'])
            ->orderBy('nombre')
            ->get([
                'id', 'nombre', 'sku', 'slug', 'status',
                'mastershop_id_product', 'mastershop_id_variant',
            ])
            ->map(fn ($p) => [
                'id'                     => $p->id,
                'nombre'                 => $p->nombre,
                'sku'                    => $p->sku,
                'slug'                   => $p->slug,
                'status'                 => $p->status,
                'mastershop_id_product'  => $p->mastershop_id_product,
                'mastershop_id_variant'  => $p->mastershop_id_variant,
                'tiene_variantes'        => $p->variableGrupos->isNotEmpty(),
                'variantes_vinculadas'   => $p->variableGrupos
                    ->flatMap->items
                    ->filter(fn ($i) => $i->mastershop_id_variant !== null)
                    ->count(),
                'variantes_total'        => $p->variableGrupos->flatMap->items->count(),
                'grupos_variantes'       => $p->variableGrupos->map(fn ($g) => [
                    'id'     => $g->id,
                    'nombre' => $g->nombre,
                    'items'  => $g->items->map(fn ($i) => [
                        'id'                    => $i->id,
                        'nombre'                => $i->nombre,
                        'mastershop_id_variant' => $i->mastershop_id_variant,
                    ])->values(),
                ])->values(),
            ])
            ->values();

        return Inertia::render('admin/integraciones/Mastershop', [
            'api_key_configurada' => ! empty(Integracion::get('mastershop_api_key')),
            'productos'           => $productos,
        ]);
    }

    public function update(Request $request, UpdateMastershopConfig $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('integraciones.editar'), 403);

        $data = $request->validate([
            'mastershop_api_key' => 'nullable|string|max:500',
        ]);

        $action->handle($data);

        return back();
    }

    /**
     * Test de conexión. Si el body trae una API key, se prueba esa (sin
     * persistirla) — útil para validar antes de guardar.
     */
    public function probar(Request $request): JsonResponse
    {
        abort_if(! auth()->user()->can('integraciones.editar'), 403);

        $data = $request->validate([
            'api_key' => 'nullable|string|max:500',
        ]);

        $key = $data['api_key'] ?? null;
        if ($key === '***') {
            $key = null; // usar la guardada
        }

        return response()->json($this->mastershop->probarConexion($key));
    }

    /**
     * Autocomplete: GET ?q=cam → devuelve productos Mastershop matching.
     * El frontend hace debounce; aquí solo cacheamos 5 min.
     */
    public function buscar(Request $request): JsonResponse
    {
        abort_if(! auth()->user()->can('integraciones.editar'), 403);

        $data = $request->validate([
            'q'     => 'nullable|string|max:100',
            'page'  => 'nullable|integer|min:1|max:100',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $resultado = $this->mastershop->buscarProductos(
            (string) ($data['q'] ?? ''),
            (int)    ($data['page']  ?? 1),
            (int)    ($data['limit'] ?? 10),
        );

        if ($resultado === null) {
            return response()->json([
                'ok'      => false,
                'mensaje' => 'No se pudo consultar Mastershop. Verificá la API key.',
            ], 422);
        }

        return response()->json([
            'ok'      => true,
            'results' => $resultado['results'],
            'total'   => $resultado['total'],
        ]);
    }

    /**
     * Detalle completo de un producto Mastershop. Lo usa el modal de
     * vinculación para mostrar las variantes y armar el mapping.
     */
    public function producto(int $idProduct): JsonResponse
    {
        abort_if(! auth()->user()->can('integraciones.editar'), 403);

        $producto = $this->mastershop->obtenerProducto($idProduct);

        if ($producto === null) {
            return response()->json([
                'ok'      => false,
                'mensaje' => 'No se encontró el producto en Mastershop.',
            ], 404);
        }

        return response()->json(['ok' => true, 'producto' => $producto]);
    }

    /**
     * Persiste la vinculación:
     *  - productos.mastershop_id_product (siempre)
     *  - productos.mastershop_id_variant (cuando NO hay variantes Linkiu —
     *    usa la Default Variant de Mastershop, primer item del array)
     *  - variable_items.mastershop_id_variant (cuando SÍ hay variantes — se
     *    espera un map [variable_item_id => idVariant Mastershop])
     */
    public function vincular(Request $request, int $productoId): RedirectResponse
    {
        abort_if(! auth()->user()->can('productos.editar'), 403);

        $data = $request->validate([
            'mastershop_id_product' => 'required|integer|min:1',
            'mastershop_id_variant' => 'nullable|integer|min:1',
            'mapping'               => 'nullable|array',
            'mapping.*'             => 'nullable|integer|min:1',
        ]);

        $producto = Producto::with('variableGrupos.items')->findOrFail($productoId);

        $producto->update([
            'mastershop_id_product' => $data['mastershop_id_product'],
            'mastershop_id_variant' => $data['mastershop_id_variant'] ?? null,
        ]);

        if (! empty($data['mapping'])) {
            $itemsValidos = $producto->variableGrupos->flatMap->items->pluck('id')->all();
            foreach ($data['mapping'] as $itemId => $idVariant) {
                if (! in_array((int) $itemId, $itemsValidos, true)) continue;
                $producto->variableGrupos
                    ->flatMap->items
                    ->firstWhere('id', (int) $itemId)
                    ?->update(['mastershop_id_variant' => $idVariant]);
            }
        }

        return back();
    }

    public function desvincular(int $productoId): RedirectResponse
    {
        abort_if(! auth()->user()->can('productos.editar'), 403);

        $producto = Producto::with('variableGrupos.items')->findOrFail($productoId);

        $producto->update([
            'mastershop_id_product' => null,
            'mastershop_id_variant' => null,
        ]);

        foreach ($producto->variableGrupos->flatMap->items as $item) {
            if ($item->mastershop_id_variant !== null) {
                $item->update(['mastershop_id_variant' => null]);
            }
        }

        return back();
    }
}
