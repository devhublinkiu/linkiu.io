<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Actions\Auth\ActivateInvitation;
use App\Http\Controllers\Controller;
use App\Models\UserInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvitationController extends Controller
{
    public function mostrar(string $token)
    {
        $invitacion = UserInvitation::where('token', $token)->first();

        if (! $invitacion || ! $invitacion->valida()) {
            return Inertia::render('auth/AcceptInvitation', ['tokenValido' => false]);
        }

        return Inertia::render('auth/AcceptInvitation', [
            'tokenValido' => true,
            'token'       => $token,
            'email'       => $invitacion->email,
        ]);
    }

    public function activar(Request $request, string $token, ActivateInvitation $action)
    {
        $request->validate([
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        $resultado = $action->execute($token, $request->password);

        if (isset($resultado['error'])) {
            return back()->withErrors(['token' => 'El enlace de invitación expiró o no es válido.']);
        }

        return redirect()->route('admin.login')
            ->with('status', '¡Tu cuenta está activa! Ya puedes ingresar.');
    }
}
