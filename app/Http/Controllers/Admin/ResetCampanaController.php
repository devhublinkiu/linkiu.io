<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Reset\ResetFunelinks;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reset\ResetFunelinksRequest;
use App\Models\FunelinksResetLog;
use App\Models\OrderDeletionLog;
use App\Models\Producto;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResetCampanaController extends Controller
{
    public function index(): Response
    {
        abort_if(! auth()->user()->can('superadmin.reset'), 403);

        return Inertia::render('admin/reset-campana/Index', [
            'productos' => Producto::query()
                ->orderBy('nombre')
                ->get(['id', 'nombre'])
                ->map(fn ($p) => ['id' => $p->id, 'nombre' => $p->nombre])
                ->toArray(),

            'audit' => [
                'ordenes'   => OrderDeletionLog::with('usuario:id,name')
                    ->orderByDesc('eliminado_at')
                    ->limit(50)
                    ->get()
                    ->map(fn ($l) => [
                        'id'                 => $l->id,
                        'codigos'            => $l->codigos,
                        'motivo'             => $l->motivo,
                        'total_eliminado_cop' => $l->total_eliminado_cop,
                        'usuario'            => $l->usuario?->name,
                        'eliminado_at'       => $l->eliminado_at->toIso8601String(),
                    ])
                    ->toArray(),

                'funelinks' => FunelinksResetLog::with(['usuario:id,name', 'producto:id,nombre'])
                    ->orderByDesc('ejecutado_at')
                    ->limit(50)
                    ->get()
                    ->map(fn ($l) => [
                        'id'              => $l->id,
                        'rango_desde'     => $l->rango_desde->toDateString(),
                        'rango_hasta'     => $l->rango_hasta->toDateString(),
                        'producto'        => $l->producto?->nombre,
                        'borrado_sesiones' => $l->borrado_sesiones,
                        'borrado_visitas' => $l->borrado_visitas,
                        'borrado_fomo'    => $l->borrado_fomo,
                        'conteo_sesiones' => $l->conteo_sesiones,
                        'conteo_visitas'  => $l->conteo_visitas,
                        'conteo_fomo'     => $l->conteo_fomo,
                        'motivo'          => $l->motivo,
                        'usuario'         => $l->usuario?->name,
                        'ejecutado_at'    => $l->ejecutado_at->toIso8601String(),
                    ])
                    ->toArray(),
            ],
        ]);
    }

    /**
     * Conteo previo a borrar — sin tocar BD. Llamado vía POST AJAX desde
     * FormResetFunelinks al cambiar cualquier filtro.
     */
    public function previewFunelinks(Request $request, ResetFunelinks $action): JsonResponse
    {
        abort_if(! auth()->user()->can('superadmin.reset'), 403);

        $data = $request->validate([
            'desde'             => ['required', 'date'],
            'hasta'             => ['required', 'date', 'after_or_equal:desde'],
            'producto_id'       => ['nullable', 'integer', 'exists:productos,id'],
            'borrar_sesiones'   => ['nullable', 'boolean'],
            'borrar_visitas'    => ['nullable', 'boolean'],
            'borrar_fomo'       => ['nullable', 'boolean'],
        ]);

        return response()->json($action->preview(
            desde:          CarbonImmutable::parse($data['desde']),
            hasta:          CarbonImmutable::parse($data['hasta']),
            productoId:     $data['producto_id'] ?? null,
            borrarSesiones: (bool) ($data['borrar_sesiones'] ?? false),
            borrarVisitas:  (bool) ($data['borrar_visitas']  ?? false),
            borrarFomo:     (bool) ($data['borrar_fomo']     ?? false),
        ));
    }

    public function resetFunelinks(ResetFunelinksRequest $request, ResetFunelinks $action): RedirectResponse
    {
        $data = $request->validated();

        $resultado = $action->execute(
            desde:          CarbonImmutable::parse($data['desde']),
            hasta:          CarbonImmutable::parse($data['hasta']),
            productoId:     $data['producto_id'] ?? null,
            borrarSesiones: (bool) ($data['borrar_sesiones'] ?? false),
            borrarVisitas:  (bool) ($data['borrar_visitas']  ?? false),
            borrarFomo:     (bool) ($data['borrar_fomo']     ?? false),
            motivo:         $data['motivo'],
        );

        $total = array_sum($resultado);

        return back()->with('status', "Funelinks: {$total} registros eliminados (S {$resultado['conteo_sesiones']} / V {$resultado['conteo_visitas']} / F {$resultado['conteo_fomo']}).");
    }
}
