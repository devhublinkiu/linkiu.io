<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Envio\DeleteZonaEnvio;
use App\Actions\Envio\StoreZonaEnvio;
use App\Actions\Envio\UpdateZonaEnvio;
use App\Http\Controllers\Controller;
use App\Http\Requests\Envio\StoreZonaEnvioRequest;
use App\Http\Requests\Envio\UpdateZonaEnvioRequest;
use App\Models\ZonaEnvio;
use App\Services\ColombiaDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionEnvioController extends Controller
{
    public function index(): Response
    {
        abort_if(! auth()->user()->can('envio.ver'), 403);

        return Inertia::render('admin/envio/Index', [
            'zonas' => ZonaEnvio::orderBy('orden')->orderBy('id')->get(),
        ]);
    }

    public function storeZona(StoreZonaEnvioRequest $request, StoreZonaEnvio $action): RedirectResponse
    {
        // authorize() del FormRequest valida el permiso (envio.editar).
        try {
            $action->handle($request->validated());
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['zona' => $e->getMessage()]);
        }

        return back()->with('status', 'Zona creada.');
    }

    public function updateZona(UpdateZonaEnvioRequest $request, ZonaEnvio $zona, UpdateZonaEnvio $action): RedirectResponse
    {
        try {
            $action->handle($zona, $request->validated());
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['zona' => $e->getMessage()]);
        }

        return back()->with('status', 'Zona actualizada.');
    }

    public function destroyZona(ZonaEnvio $zona, DeleteZonaEnvio $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('envio.editar'), 403);

        $action->handle($zona);

        return back()->with('status', 'Zona eliminada.');
    }

    /**
     * Proxy cacheado a api-colombia.com — el frontend del ZonaDialog llama aquí
     * en lugar de pegarle directo a la API externa. Reduce latencia (cache 24h)
     * y nos blinda ante caídas momentáneas del servicio externo.
     */
    public function colombiaData(ColombiaDataService $service): JsonResponse
    {
        abort_if(! auth()->user()->can('envio.editar'), 403);

        try {
            return response()->json($service->obtener());
        } catch (\RuntimeException $e) {
            return response()->json([
                'error' => 'No se pudo cargar la lista de departamentos y ciudades. Intenta en unos minutos.',
            ], 503);
        }
    }
}
