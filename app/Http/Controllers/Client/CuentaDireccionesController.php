<?php

namespace App\Http\Controllers\Client;

use App\Actions\Cuenta\Direcciones\ActualizarDireccion;
use App\Actions\Cuenta\Direcciones\CrearDireccion;
use App\Actions\Cuenta\Direcciones\EliminarDireccion;
use App\Actions\Cuenta\Direcciones\MarcarPredeterminada;
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

    public function store(Request $request, CrearDireccion $action)
    {
        $datos = $request->validate([
            'etiqueta'     => 'nullable|string|max:50',
            'departamento' => 'required|string|max:100',
            'ciudad'       => 'required|string|max:100',
            'direccion'    => 'required|string|max:300',
            'apartamento'  => 'nullable|string|max:100',
        ]);

        $action->execute(auth('client')->user(), $datos);

        return back()->with('status', 'Dirección creada.');
    }

    public function update(Request $request, ClientAddress $address, ActualizarDireccion $action)
    {
        $this->authorizeAddress($address);

        $datos = $request->validate([
            'etiqueta'     => 'nullable|string|max:50',
            'departamento' => 'required|string|max:100',
            'ciudad'       => 'required|string|max:100',
            'direccion'    => 'required|string|max:300',
            'apartamento'  => 'nullable|string|max:100',
        ]);

        $action->execute(auth('client')->user(), $address, $datos);

        return back()->with('status', 'Dirección actualizada.');
    }

    public function destroy(ClientAddress $address, EliminarDireccion $action)
    {
        $this->authorizeAddress($address);

        $action->execute(auth('client')->user(), $address);

        return back()->with('status', 'Dirección eliminada.');
    }

    public function setPredeterminada(ClientAddress $address, MarcarPredeterminada $action)
    {
        $this->authorizeAddress($address);

        $action->execute(auth('client')->user(), $address);

        return back()->with('status', 'Dirección predeterminada actualizada.');
    }

    private function authorizeAddress(ClientAddress $address): void
    {
        if ($address->client_id !== auth('client')->id()) {
            abort(403);
        }
    }
}
