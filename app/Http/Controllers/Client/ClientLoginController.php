<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientLoginController extends Controller
{
    public function mostrar()
    {
        if (auth('client')->check()) {
            return redirect()->route('cuenta.pedidos');
        }

        return Inertia::render('clients/Login');
    }

    public function autenticar(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (! auth('client')->attempt([
            'email'    => $request->email,
            'password' => $request->password,
        ], $request->boolean('recordar'))) {
            return back()->withErrors(['email' => 'Correo o contraseña incorrectos.']);
        }

        $request->session()->regenerate();

        // Permite redirigir a una ruta interna después del login (ej: checkout)
        $redirectTo = $request->input('redirect');
        if ($redirectTo && str_starts_with($redirectTo, '/')) {
            return redirect($redirectTo);
        }

        return redirect()->intended(route('cuenta.pedidos'));
    }

    public function logout(Request $request)
    {
        auth('client')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
