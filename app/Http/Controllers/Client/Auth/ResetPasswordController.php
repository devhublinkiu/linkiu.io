<?php

namespace App\Http\Controllers\Client\Auth;

use App\Actions\Auth\ResetPassword;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResetPasswordController extends Controller
{
    public function mostrar()
    {
        if (! session('cliente_reset_token_verificado')) {
            return redirect()->route('cuenta.forgot-password');
        }

        return Inertia::render('clients/auth/ResetPassword');
    }

    public function actualizar(Request $request, ResetPassword $action)
    {
        $request->validate([
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        $email = session('cliente_reset_email');
        $token = session('cliente_reset_token_verificado');

        if (! $email || ! $token) {
            return redirect()->route('cuenta.forgot-password');
        }

        $resultado = $action->execute($email, $token, $request->password, 'client');

        if (isset($resultado['error'])) {
            return redirect()->route('cuenta.forgot-password')
                ->withErrors(['email' => 'El enlace expiró. Intenta de nuevo.']);
        }

        session()->forget([
            'cliente_reset_email',
            'cliente_reset_codigo',
            'cliente_reset_token',
            'cliente_reset_phone',
            'cliente_reset_metodo',
            'cliente_reset_token_verificado',
        ]);

        return redirect()->route('cuenta.login')
            ->with('status', 'Contraseña actualizada. Inicia sesión con tu nueva contraseña.');
    }
}
