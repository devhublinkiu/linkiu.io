<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Actions\Auth\SendOTP;
use App\Actions\Auth\VerifyOTP;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OTPController extends Controller
{
    public function mostrarMetodo(Request $request)
    {
        if (! session('reset_email')) {
            return redirect()->route('admin.forgot-password');
        }

        $tieneWhatsapp = (bool) session('reset_phone');

        return Inertia::render('auth/ChooseOTPMethod', [
            'tieneWhatsapp' => $tieneWhatsapp,
        ]);
    }

    public function enviarOTP(Request $request, SendOTP $action)
    {
        $request->validate([
            'metodo' => 'required|in:correo,whatsapp',
        ]);

        $email   = session('reset_email');
        $codigo  = session('reset_codigo');

        if (! $email || ! $codigo) {
            return redirect()->route('admin.forgot-password');
        }

        $usuario = User::where('email', $email)->first();

        $enviado = $action->execute($usuario, $request->metodo, $codigo);

        if (! $enviado) {
            return back()->withErrors(['metodo' => 'No se pudo enviar el código. Intenta con otro método.']);
        }

        session(['reset_metodo' => $request->metodo]);

        return Inertia::render('auth/VerifyOTP', [
            'metodo' => $request->metodo,
            'email'  => $email,
        ]);
    }

    public function verificar(Request $request, VerifyOTP $action)
    {
        $request->validate([
            'codigo' => 'required|string|size:6',
        ]);

        $email = session('reset_email');

        if (! $email) {
            return redirect()->route('admin.forgot-password');
        }

        $resultado = $action->execute($email, $request->codigo);

        if (isset($resultado['error'])) {
            if ($resultado['error'] === 'cuenta_bloqueada') {
                return redirect()->route('admin.blocked');
            }

            return back()->withErrors([
                'codigo' => $resultado['error'] === 'otp_expirado'
                    ? 'El código expiró. Solicita uno nuevo.'
                    : "Código incorrecto. Intentos restantes: {$resultado['intentos_restantes']}",
            ]);
        }

        session(['reset_token_verificado' => $resultado['token_reset']]);

        return redirect()->route('admin.reset-password');
    }
}
