<?php

namespace App\Http\Controllers\Client;

use App\Actions\Cuenta\ActualizarPerfilCliente;
use App\Actions\Cuenta\CambiarPassword;
use App\Http\Controllers\Controller;
use App\Rules\TelefonoMovilCO;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CuentaController extends Controller
{
    public function pedidos()
    {
        $client = auth('client')->user();

        $ordenes = $client->orders()
            ->select('id', 'codigo', 'acceso_token', 'estado', 'total', 'metodo_pago', 'created_at')
            ->latest()
            ->paginate(10)
            ->through(fn ($o) => [
                'id'           => $o->id,
                'codigo'       => $o->codigo,
                'acceso_token' => $o->acceso_token,
                'estado'       => $o->estado,
                'total'        => $o->total,
                'metodo_pago'  => $o->metodo_pago,
                'created_at'   => $o->created_at->format('d/m/Y H:i'),
            ]);

        return Inertia::render('clients/cuenta/Pedidos', [
            'ordenes' => $ordenes,
        ]);
    }

    public function perfil()
    {
        $client = auth('client')->user();

        return Inertia::render('clients/cuenta/Perfil', [
            'cliente' => [
                'nombre'   => $client->nombre,
                'apellido' => $client->apellido,
                'email'    => $client->email,
                'telefono' => $client->telefono,
            ],
        ]);
    }

    public function updatePerfil(Request $request, ActualizarPerfilCliente $action)
    {
        $datos = $request->validate([
            'nombre'   => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'telefono' => ['required', 'string', 'max:30', new TelefonoMovilCO],
        ]);

        $action->execute(auth('client')->user(), $datos);

        return back()->with('status', 'Perfil actualizado.');
    }

    public function seguridad()
    {
        return Inertia::render('clients/cuenta/Seguridad');
    }

    public function updatePassword(Request $request, CambiarPassword $action)
    {
        $request->validate([
            'password_actual' => 'required',
            'password_nueva'  => 'required|string|min:8|confirmed',
        ]);

        $ok = $action->execute(auth('client')->user(), $request->password_actual, $request->password_nueva);

        if (! $ok) {
            return back()->withErrors(['password_actual' => 'La contraseña actual es incorrecta.']);
        }

        return back()->with('status', 'Contraseña actualizada.');
    }
}
