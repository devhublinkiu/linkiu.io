<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Envio\DeleteZonaEnvio;
use App\Actions\Envio\StoreZonaEnvio;
use App\Actions\Envio\UpdateZonaEnvio;
use App\Http\Controllers\Controller;
use App\Models\ZonaEnvio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionEnvioController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/envio/Index', [
            'zonas' => ZonaEnvio::orderBy('orden')->orderBy('id')->get(),
        ]);
    }

    public function storeZona(Request $request, StoreZonaEnvio $action): RedirectResponse
    {
        $data = $request->validate([
            'nombre'                              => 'required|string|max:100',
            'departamentos'                       => 'required|array|min:1',
            'departamentos.*.id'                  => 'required|integer',
            'departamentos.*.nombre'              => 'required|string|max:100',
            'departamentos.*.ciudades'            => 'required|array|min:1',
            'departamentos.*.ciudades.*.id'       => 'required|integer',
            'departamentos.*.ciudades.*.nombre'   => 'required|string|max:100',
            'tipo_costo'                          => 'required|in:gratis,costo_fijo,gratis_desde',
            'costo'                               => 'nullable|integer|min:0',
            'umbral_gratis'                       => 'nullable|integer|min:0',
        ]);

        $action->handle($data);

        return back();
    }

    public function updateZona(Request $request, ZonaEnvio $zona, UpdateZonaEnvio $action): RedirectResponse
    {
        $data = $request->validate([
            'nombre'                              => 'required|string|max:100',
            'departamentos'                       => 'required|array|min:1',
            'departamentos.*.id'                  => 'required|integer',
            'departamentos.*.nombre'              => 'required|string|max:100',
            'departamentos.*.ciudades'            => 'required|array|min:1',
            'departamentos.*.ciudades.*.id'       => 'required|integer',
            'departamentos.*.ciudades.*.nombre'   => 'required|string|max:100',
            'tipo_costo'                          => 'required|in:gratis,costo_fijo,gratis_desde',
            'costo'                               => 'nullable|integer|min:0',
            'umbral_gratis'                       => 'nullable|integer|min:0',
        ]);

        $action->handle($zona, $data);

        return back();
    }

    public function destroyZona(ZonaEnvio $zona, DeleteZonaEnvio $action): RedirectResponse
    {
        $action->handle($zona);

        return back();
    }
}
