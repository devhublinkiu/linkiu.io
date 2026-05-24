<?php

namespace App\Http\Controllers\Client\Auth;

use App\Actions\Auth\SendOTP;
use App\Actions\Auth\VerifyOTP;
use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OTPController extends Controller
{
    public function mostrarMetodo(Request $request)
    {
        if (! session('cliente_reset_email')) {
            return redirect()->route('cuenta.forgot-password');
        }

        $tieneWhatsapp = (bool) session('cliente_reset_phone');

        return Inertia::render('clients/auth/ChooseOTPMethod', [
            'tieneWhatsapp' => $tieneWhatsapp,
        ]);
    }

    public function enviarOTP(Request $request, SendOTP $action)
    {
        $request->validate([
            'metodo' => 'required|in:correo,whatsapp',
        ]);

        $email  = session('cliente_reset_email');
        $codigo = session('cliente_reset_codigo');

        if (! $email || ! $codigo) {
            return redirect()->route('cuenta.forgot-password');
        }

        $cliente = Client::where('email', $email)->first();

        if (! $cliente) {
            return redirect()->route('cuenta.forgot-password');
        }

        $enviado = $action->execute($cliente, $request->metodo, $codigo, 'client');

        if (! $enviado) {
            return back()->withErrors(['metodo' => 'No se pudo enviar el código. Intenta con otro método.']);
        }

        session(['cliente_reset_metodo' => $request->metodo]);

        return Inertia::render('clients/auth/VerifyOTP', [
            'metodo' => $request->metodo,
            'email'  => $email,
        ]);
    }

    public function verificar(Request $request, VerifyOTP $action)
    {
        $request->validate([
            'codigo' => 'required|string|size:6',
        ]);

        $email = session('cliente_reset_email');

        if (! $email) {
            return redirect()->route('cuenta.forgot-password');
        }

        $resultado = $action->execute($email, $request->codigo, 'client');

        if (isset($resultado['error'])) {
            if ($resultado['error'] === 'cuenta_bloqueada') {
                return redirect()->route('cuenta.blocked');
            }

            return back()->withErrors([
                'codigo' => $resultado['error'] === 'otp_expirado'
                    ? 'El código expiró. Solicita uno nuevo.'
                    : "Código incorrecto. Intentos restantes: {$resultado['intentos_restantes']}",
            ]);
        }

        session(['cliente_reset_token_verificado' => $resultado['token_reset']]);

        return redirect()->route('cuenta.reset-password');
    }
}
