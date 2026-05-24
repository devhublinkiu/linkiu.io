<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Integraciones\UpdatePixelesConfig;
use App\Http\Controllers\Controller;
use App\Http\Requests\Integraciones\UpdatePixelesRequest;
use App\Models\Integracion;
use App\Models\Producto;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class IntegracionPixelesController extends Controller
{
    public function show(): Response
    {
        abort_if(! auth()->user()->can('integraciones.ver'), 403);

        $producto = Producto::where('status', 'activo')->latest()->first();

        return Inertia::render('admin/integraciones/Pixeles', [
            'pixeles' => [
                'fb_pixel_id'               => Integracion::get('fb_pixel_id'),
                'fb_test_event_code'        => Integracion::get('fb_test_event_code'),
                'google_ads_id'             => Integracion::get('google_ads_id'),
                'google_ads_purchase_label' => Integracion::get('google_ads_purchase_label'),
            ],
            'probar_url' => $producto ? "/productos/{$producto->slug}?debug_pixel=1" : null,
        ]);
    }

    public function update(UpdatePixelesRequest $request, UpdatePixelesConfig $action): RedirectResponse
    {
        $action->handle($request->validated());

        return back()->with('status', 'Pixeles guardados correctamente.');
    }
}
