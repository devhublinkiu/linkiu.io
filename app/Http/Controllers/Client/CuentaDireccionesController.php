<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ClientAddress;
use App\Models\ZonaEnvio;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CuentaDireccionesController extends Controller
{
    public function index()
    {
        $client = auth('client')->user();

        $direcciones = $client->addresses()
            ->orderByDesc('predeterminada')
            ->orderBy('id')
            ->get()
            ->map(fn ($d) => [
                'id'             => $d->id,
                'etiqueta'       => $d->etiqueta,
                'departamento'   => $d->departamento,
                'ciudad'         => $d->ciudad,
                'direccion'      => $d->direccion,
                'apartamento'    => $d->apartamento,
                'predeterminada' => $d->predeterminada,
            ]);

        $zonas = ZonaEnvio::where('activo', true)
            ->orderBy('orden')
            ->orderBy('id')
            ->get()
            ->map(fn ($z) => [
                'id'            => $z->id,
                'nombre'        => $z->nombre,
                'departamentos' => $z->departamentos,
            ]);

        return Inertia::render('clients/cuenta/Direcciones', [
            'direcciones' => $direcciones,
            'zonas'       => $zonas,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'etiqueta'     => 'nullable|string|max:50',
            'departamento' => 'required|string|max:100',
            'ciudad'       => 'required|string|max:100',
            'direccion'    => 'required|string|max:300',
            'apartamento'  => 'nullable|string|max:100',
        ]);

        $client = auth('client')->user();

        // Rellenar nombre/telefono desde el perfil del cliente
        $data['nombre']   = $client->nombre . ' ' . $client->apellido;
        $data['telefono'] = $client->telefono;

        if ($client->addresses()->count() === 0) {
            $data['predeterminada'] = true;
        }

        $client->addresses()->create($data);

        return back();
    }

    public function update(Request $request, ClientAddress $address)
    {
        $this->authorizeAddress($address);

        $data = $request->validate([
            'etiqueta'     => 'nullable|string|max:50',
            'departamento' => 'required|string|max:100',
            'ciudad'       => 'required|string|max:100',
            'direccion'    => 'required|string|max:300',
            'apartamento'  => 'nullable|string|max:100',
        ]);

        $client = auth('client')->user();
        $data['nombre']   = $client->nombre . ' ' . $client->apellido;
        $data['telefono'] = $client->telefono;

        $address->update($data);

        return back();
    }

    public function destroy(ClientAddress $address)
    {
        $this->authorizeAddress($address);

        $wasPredeterminada = $address->predeterminada;
        $client            = auth('client')->user();

        $address->delete();

        if ($wasPredeterminada) {
            $client->addresses()->oldest()->first()?->update(['predeterminada' => true]);
        }

        return back();
    }

    public function setPredeterminada(ClientAddress $address)
    {
        $this->authorizeAddress($address);

        $client = auth('client')->user();
        $client->addresses()->update(['predeterminada' => false]);
        $address->update(['predeterminada' => true]);

        return back();
    }

    private function authorizeAddress(ClientAddress $address): void
    {
        if ($address->client_id !== auth('client')->id()) {
            abort(403);
        }
    }
}
