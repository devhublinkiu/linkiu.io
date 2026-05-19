<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Integraciones\UpdatePixelesConfig;
use App\Http\Controllers\Controller;
use App\Models\Integracion;
use App\Models\Producto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntegracionPixelesController extends Controller
{
    public function show(): Response
    {
        $producto = Producto::where('status', 'activo')->latest()->first();

        return Inertia::render('admin/integraciones/Pixeles', [
            'pixeles' => [
                'fb_pixel_id'        => Integracion::get('fb_pixel_id'),
                'fb_test_event_code' => Integracion::get('fb_test_event_code'),
                'google_ads_id'      => Integracion::get('google_ads_id'),
            ],
            'probar_url' => $producto ? "/productos/{$producto->slug}?debug_pixel=1" : null,
        ]);
    }

    public function update(Request $request, UpdatePixelesConfig $action): RedirectResponse
    {
        $data = $request->validate([
            'fb_pixel_id'        => 'nullable|string|max:100',
            'fb_test_event_code' => 'nullable|string|max:50',
            'google_ads_id'      => 'nullable|string|max:100',
        ]);

        $action->handle($data);

        return back();
    }
}
