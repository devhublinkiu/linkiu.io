<?php

namespace App\Http\Controllers;

use App\Mail\ContactoMail;
use App\Models\BuildConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactoFormController extends Controller
{
    public function enviar(Request $request): RedirectResponse
    {
        if ($request->filled('_hp')) {
            return back();
        }

        $raw       = BuildConfig::get('build_contacto_form_config');
        $config    = $raw ? json_decode($raw, true) : null;
        $destino   = $config['correo_destino'] ?? null;
        $campos    = $config['campos'] ?? $this->camposDefault();

        usort($campos, fn ($a, $b) => ($a['orden'] ?? 99) <=> ($b['orden'] ?? 99));

        $activos = array_filter($campos, fn ($c) => !empty($c['activo']));

        $rules = [];
        foreach ($activos as $campo) {
            $key       = $campo['key'];
            $requerido = !empty($campo['requerido']);
            $rules[$key] = match ($key) {
                'correo'  => [($requerido ? 'required' : 'nullable'), 'email', 'max:200'],
                'mensaje' => [($requerido ? 'required' : 'nullable'), 'string', 'max:2000'],
                default   => [($requerido ? 'required' : 'nullable'), 'string', 'max:200'],
            };
        }

        $datos = $request->validate($rules);

        if (! $destino) {
            return back()->with('contacto_error', 'No hay correo de destino configurado.');
        }

        Mail::to($destino)->send(new ContactoMail($datos));

        return back()->with('contacto_enviado', true);
    }

    private function camposDefault(): array
    {
        return [
            ['key' => 'nombre',  'activo' => true,  'requerido' => true,  'orden' => 1],
            ['key' => 'correo',  'activo' => true,  'requerido' => true,  'orden' => 2],
            ['key' => 'asunto',  'activo' => true,  'requerido' => false, 'orden' => 3],
            ['key' => 'mensaje', 'activo' => true,  'requerido' => true,  'orden' => 4],
            ['key' => 'celular', 'activo' => false, 'requerido' => false, 'orden' => 5],
            ['key' => 'empresa', 'activo' => false, 'requerido' => false, 'orden' => 6],
        ];
    }
}
