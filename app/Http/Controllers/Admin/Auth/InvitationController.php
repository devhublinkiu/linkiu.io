<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Actions\Auth\ActivateInvitation;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvitationController extends Controller
{
    public function mostrar(string $token)
    {
        $datos = cache()->get("invitation_{$token}");

        if (! $datos) {
            return Inertia::render('auth/AcceptInvitation', ['tokenValido' => false]);
        }

        return Inertia::render('auth/AcceptInvitation', [
            'tokenValido' => true,
            'token'       => $token,
            'email'       => $datos['email'],
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
