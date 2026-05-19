<?php

namespace App\Http\Controllers\Admin;

use App\Actions\MetodosPago\ToggleMetodoPago;
use App\Actions\MetodosPago\UpdateMetodoPagoConfig;
use App\Http\Controllers\Controller;
use App\Models\Integracion;
use App\Models\MetodoPago;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MetodosPagoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/metodos-pago/Index', [
            'metodos'        => MetodoPago::orderBy('orden')->get(),
            'mp_configurado' => (bool) Integracion::get('mp_access_token'),
            'mp_sandbox'     => Integracion::get('mp_sandbox', '1') === '1',
        ]);
    }

    public function toggle(MetodoPago $metodo, ToggleMetodoPago $action): RedirectResponse
    {
        try {
            $action->handle($metodo);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['metodo' => $e->getMessage()]);
        }

        return back();
    }

    public function updateConfig(MetodoPago $metodo, Request $request, UpdateMetodoPagoConfig $action): RedirectResponse
    {
        $data = $request->validate([
            'config'                       => 'nullable|array',
            'config.recargo'               => 'nullable|integer|min:0',
            'config.banco'                 => 'nullable|string|max:100',
            'config.tipo_cuenta'           => 'nullable|in:ahorros,corriente,bre-b,billetera-virtual',
            'config.numero_cuenta'         => 'nullable|string|max:50',
            'config.titular'               => 'nullable|string|max:150',
            'config.tipo_doc'              => 'nullable|in:CC,NIT,CE,PA',
            'config.numero_doc'            => 'nullable|string|max:20',
            'config.instrucciones'         => 'nullable|string|max:500',
            'config.comprobante_requerido' => 'nullable|boolean',
        ]);

        $action->handle($metodo, $data['config'] ?? []);

        return back();
    }
}
