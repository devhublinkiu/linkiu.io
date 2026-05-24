<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Integraciones\UpdatePasarelasConfig;
use App\Http\Controllers\Controller;
use App\Models\Integracion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntegracionPasarelasController extends Controller
{
    public function show(): Response
    {
        abort_if(! auth()->user()->can('integraciones.ver'), 403);

        return Inertia::render('admin/integraciones/Pasarelas', [
            'mp_access_token_sandbox' => Integracion::get('mp_access_token_sandbox'),
            'mp_public_key_sandbox'   => Integracion::get('mp_public_key_sandbox'),
            'mp_access_token_prod'    => Integracion::get('mp_access_token_prod'),
            'mp_public_key_prod'      => Integracion::get('mp_public_key_prod'),
            'mp_webhook_secret'       => Integracion::get('mp_webhook_secret'),
            'mp_sandbox'              => Integracion::get('mp_sandbox', '1') === '1',
            'webhook_url'             => route('mp.webhook'),
        ]);
    }

    public function update(Request $request, UpdatePasarelasConfig $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('integraciones.editar'), 403);

        $data = $request->validate([
            'mp_access_token_sandbox' => 'nullable|string|max:200',
            'mp_public_key_sandbox'   => 'nullable|string|max:200',
            'mp_access_token_prod'    => 'nullable|string|max:200',
            'mp_public_key_prod'      => 'nullable|string|max:200',
            'mp_webhook_secret'       => 'nullable|string|max:200',
            'mp_sandbox'              => 'boolean',
        ]);

        $action->handle($data);

        return back();
    }
}
