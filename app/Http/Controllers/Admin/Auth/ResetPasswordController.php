<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Actions\Auth\ResetPassword;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResetPasswordController extends Controller
{
    public function mostrar()
    {
        if (! session('reset_token_verificado')) {
            return redirect()->route('admin.forgot-password');
        }

        return Inertia::render('auth/ResetPassword');
    }

    public function actualizar(Request $request, ResetPassword $action)
    {
        $request->validate([
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        $email = session('reset_email');
        $token = session('reset_token_verificado');

        if (! $email || ! $token) {
            return redirect()->route('admin.forgot-password');
        }

        $resultado = $action->execute($email, $token, $request->password);

        if (isset($resultado['error'])) {
            return redirect()->route('admin.forgot-password')
                ->withErrors(['email' => 'El enlace expiró. Intenta de nuevo.']);
        }

        // Limpiar sesión del flujo de reset
        session()->forget(['reset_email', 'reset_codigo', 'reset_token', 'reset_phone', 'reset_metodo', 'reset_token_verificado']);

        return redirect()->route('admin.login')
            ->with('status', 'password-updated');
    }
}
