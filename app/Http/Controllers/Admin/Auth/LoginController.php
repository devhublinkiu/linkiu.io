<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Actions\Auth\LoginAdmin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function mostrar()
    {
        return Inertia::render('auth/Login');
    }

    public function autenticar(Request $request, LoginAdmin $action)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $resultado = $action->execute(
            $request->email,
            $request->password,
            $request->boolean('recordar')
        );

        if (isset($resultado['error'])) {
            if ($resultado['error'] === 'cuenta_bloqueada') {
                return redirect()->route('admin.blocked')->with([
                    'bloqueado_hasta' => $resultado['bloqueado_hasta'],
                ]);
            }

            return back()->withErrors([
                'email' => isset($resultado['intentos_restantes'])
                    ? "Credenciales incorrectas. Intentos restantes: {$resultado['intentos_restantes']}"
                    : 'Credenciales incorrectas.',
            ])->withInput($request->only('email'));
        }

        $request->session()->regenerate();

        return redirect()->route('admin.dashboard');
    }

    public function cerrarSesion(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }

    public function reenviarVerificacion(Request $request)
    {
        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }
}
