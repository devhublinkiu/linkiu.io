<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class CuentaController extends Controller
{
    public function pedidos()
    {
        $client = auth('client')->user();

        $ordenes = $client->orders()
            ->select('id', 'codigo', 'estado', 'total', 'metodo_pago', 'created_at')
            ->latest()
            ->get()
            ->map(fn ($o) => [
                'id'          => $o->id,
                'codigo'      => $o->codigo,
                'estado'      => $o->estado,
                'total'       => $o->total,
                'metodo_pago' => $o->metodo_pago,
                'created_at'  => $o->created_at->format('d/m/Y H:i'),
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

    public function updatePerfil(Request $request)
    {
        $request->validate([
            'nombre'   => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'telefono' => 'required|string|max:30',
        ]);

        auth('client')->user()->update($request->only('nombre', 'apellido', 'telefono'));

        return back();
    }

    public function seguridad()
    {
        return Inertia::render('clients/cuenta/Seguridad');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'password_actual' => 'required',
            'password_nueva'  => 'required|string|min:8|confirmed',
        ]);

        $client = auth('client')->user();

        if (! Hash::check($request->password_actual, $client->password)) {
            return back()->withErrors(['password_actual' => 'La contraseña actual es incorrecta.']);
        }

        $client->update(['password' => $request->password_nueva]);

        return back();
    }
}
