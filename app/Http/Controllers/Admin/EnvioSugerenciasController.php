<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BuildConfig;
use App\Models\Integracion;
use App\Services\MipaqueteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Endpoints para configurar Mipaquete + obtener sugerencias de costos.
 *
 * GET  /admin/envio/mipaquete/config        → estado actual (UI del modal)
 * POST /admin/envio/mipaquete/config        → guardar credenciales + bodega + paquete
 * POST /admin/envio/mipaquete/sugerencias   → recibe [danes] y devuelve mapa con rangos
 */
class EnvioSugerenciasController extends Controller
{
    public function __construct(private MipaqueteService $mipaquete) {}

    public function config(Request $request): JsonResponse
    {
        abort_if(! $request->user()->can('envio.ver'), 403);

        return response()->json([
            'configurado'        => $this->mipaquete->tieneCredenciales(),
            'tiene_api_key'      => ! empty(Integracion::get('mipaquete_api_key')),
            'bodega_dane_code'   => BuildConfig::get('envio_bodega_dane_code'),
            'paquete_preset'     => BuildConfig::get('envio_paquete_preset', 'pequeno'),
            'presets_disponibles' => collect(config('services.mipaquete.presets', []))
                ->map(fn ($p, $k) => [
                    'key'            => $k,
                    'label'          => $p['label'],
                    'weight'         => $p['weight'],
                    'height'         => $p['height'],
                    'width'          => $p['width'],
                    'length'         => $p['length'],
                    'declaredValue'  => $p['declaredValue'],
                ])
                ->values()
                ->all(),
        ]);
    }

    public function guardarConfig(\App\Http\Requests\Envio\UpdateMipaqueteConfigRequest $request): JsonResponse
    {
        $data = $request->validated();

        // API key — solo escribimos si el frontend envía un valor distinto
        // al sentinel '***' (que significa "no tocar").
        if (isset($data['mipaquete_api_key'])
            && $data['mipaquete_api_key'] !== '***'
            && $data['mipaquete_api_key'] !== ''
        ) {
            Integracion::set('mipaquete_api_key', $data['mipaquete_api_key']);
        }

        if (! empty($data['bodega_dane_code'])) {
            BuildConfig::set('envio_bodega_dane_code', $data['bodega_dane_code']);
        }
        if (! empty($data['paquete_preset'])) {
            BuildConfig::set('envio_paquete_preset', $data['paquete_preset']);
        }

        return response()->json(['ok' => true]);
    }

    public function sugerencias(Request $request): JsonResponse
    {
        abort_if(! $request->user()->can('envio.ver'), 403);

        if (! $this->mipaquete->tieneCredenciales()) {
            return response()->json([
                'configurado' => false,
                'sugerencias' => [],
            ]);
        }

        $request->validate([
            'codigos'   => ['required', 'array', 'min:1', 'max:200'],
            'codigos.*' => ['required', 'string', 'regex:/^\d{5,8}$/'],
        ]);

        $sugerencias = $this->mipaquete->cotizarMultiple($request->input('codigos'));

        return response()->json([
            'configurado' => true,
            'sugerencias' => $sugerencias,
        ]);
    }
}
