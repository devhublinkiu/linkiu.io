<?php

namespace App\Http\Controllers\Admin;

use App\Actions\MetodosPago\ToggleMetodoPago;
use App\Actions\MetodosPago\UpdateMetodoPagoConfig;
use App\Http\Controllers\Controller;
use App\Http\Requests\MetodosPago\UpdateMetodoPagoConfigRequest;
use App\Models\Integracion;
use App\Models\MetodoPago;
use App\Services\MercadoPagoService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MetodosPagoController extends Controller
{
    public function index(MercadoPagoService $mp): Response
    {
        abort_if(! auth()->user()->can('metodos-pago.ver'), 403);

        return Inertia::render('admin/metodos-pago/Index', [
            'metodos'        => MetodoPago::orderBy('orden')->get(),
            // tieneCredenciales() chequea el modo activo (sandbox/prod) — fix del bug
            // donde leíamos la clave inexistente 'mp_access_token' que siempre era false.
            'mp_configurado' => $mp->tieneCredenciales(),
            'mp_sandbox'     => Integracion::get('mp_sandbox', '1') === '1',
        ]);
    }

    public function toggle(MetodoPago $metodo, ToggleMetodoPago $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('metodos-pago.editar'), 403);

        try {
            $action->handle($metodo);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['metodo' => $e->getMessage()]);
        }

        return back()->with(
            'status',
            $metodo->fresh()->activo ? 'Método activado.' : 'Método desactivado.',
        );
    }

    public function updateConfig(MetodoPago $metodo, UpdateMetodoPagoConfigRequest $request, UpdateMetodoPagoConfig $action): RedirectResponse
    {
        // authorize() del FormRequest ya valida el permiso (metodos-pago.editar).
        $action->handle($metodo, $request->validated('config') ?? []);

        return back()->with('status', 'Configuración guardada.');
    }
}
