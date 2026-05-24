<?php

namespace App\Http\Controllers\Client\Auth;

use App\Actions\Auth\RequestPasswordReset;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ForgotPasswordController extends Controller
{
    public function mostrar()
    {
        return Inertia::render('clients/auth/ForgotPassword');
    }

    public function enviar(Request $request, RequestPasswordReset $action)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email     = strtolower(trim($request->email));
        $resultado = $action->execute($email, 'client');

        // Siempre redirigimos — no revelamos si el correo existe
        if ($resultado) {
            session([
                'cliente_reset_email'  => $email,
                'cliente_reset_codigo' => $resultado['codigo'],
                'cliente_reset_token'  => $resultado['token'],
                'cliente_reset_phone'  => $resultado['phone'],
            ]);
        }

        return redirect()->route('cuenta.choose-otp-method');
    }
}
