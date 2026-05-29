<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AntifraudeRegla;
use App\Models\ClienteBlacklist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Configuración del motor antifraude (Capa 2).
 *
 * - show:            página única con 3 reglas + listado blacklist
 * - updateReglas:    upsert array de reglas (activa + parametros)
 * - storeBlacklist:  agregar entrada (telefono o email)
 * - destroyBlacklist: remover entrada
 */
class AntifraudeController extends Controller
{
    public function show(): Response
    {
        abort_if(! auth()->user()->can('antifraude.ver'), 403);

        $reglas = AntifraudeRegla::query()
            ->orderBy('id')
            ->get(['clave', 'activa', 'parametros'])
            ->keyBy('clave');

        $blacklist = ClienteBlacklist::query()
            ->latest('id')
            ->get(['id', 'tipo', 'valor', 'motivo', 'created_at']);

        return Inertia::render('admin/antifraude/Configuracion', [
            'reglas'    => $reglas,
            'blacklist' => $blacklist,
        ]);
    }

    public function updateReglas(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('antifraude.editar'), 403);

        $data = $request->validate([
            'reglas'                       => ['required', 'array'],
            'reglas.*.clave'               => ['required', 'string'],
            'reglas.*.activa'              => ['required', 'boolean'],
            'reglas.*.parametros'          => ['nullable', 'array'],
        ]);

        foreach ($data['reglas'] as $entrada) {
            AntifraudeRegla::where('clave', $entrada['clave'])->update([
                'activa'     => $entrada['activa'],
                'parametros' => $entrada['parametros'] ?? null,
            ]);
        }

        return back()->with('status', 'Reglas actualizadas.');
    }

    public function storeBlacklist(Request $request): RedirectResponse
    {
        abort_if(! auth()->user()->can('antifraude.editar'), 403);

        $data = $request->validate([
            'tipo'   => ['required', 'in:telefono,email'],
            'valor'  => ['required', 'string', 'max:200'],
            'motivo' => ['nullable', 'string', 'max:200'],
        ]);

        // Normalización por tipo: teléfono sin caracteres no numéricos, email lowercase.
        $valor = $data['tipo'] === 'telefono'
            ? preg_replace('/\D+/', '', $data['valor'])
            : strtolower(trim($data['valor']));

        ClienteBlacklist::firstOrCreate(
            ['tipo' => $data['tipo'], 'valor' => $valor],
            ['motivo' => $data['motivo'] ?? null, 'created_by' => auth()->id()],
        );

        return back()->with('status', 'Entrada agregada a la blacklist.');
    }

    public function destroyBlacklist(ClienteBlacklist $entry): RedirectResponse
    {
        abort_if(! auth()->user()->can('antifraude.editar'), 403);

        $entry->delete();

        return back()->with('status', 'Entrada eliminada.');
    }
}
