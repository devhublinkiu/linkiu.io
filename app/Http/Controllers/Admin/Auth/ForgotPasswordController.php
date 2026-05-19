<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Actions\Auth\RequestPasswordReset;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ForgotPasswordController extends Controller
{
    public function mostrar()
    {
        return Inertia::render('auth/ForgotPassword');
    }

    public function enviar(Request $request, RequestPasswordReset $action)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $resultado = $action->execute($request->email);

        // Siempre redirigimos — no revelamos si el correo existe
        if ($resultado) {
            session([
                'reset_email'  => $request->email,
                'reset_codigo' => $resultado['codigo'],
                'reset_token'  => $resultado['token'],
                'reset_phone'  => $resultado['usuario']->phone,
            ]);
        }

        return redirect()->route('admin.choose-otp-method');
    }
}
