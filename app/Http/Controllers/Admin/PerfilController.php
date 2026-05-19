<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Perfil\UpdateDatosPersonales;
use App\Actions\Perfil\UpdateDatosTienda;
use App\Http\Controllers\Controller;
use App\Models\Integracion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PerfilController extends Controller
{
    public function show(): Response
    {
        $user = auth()->user();

        return Inertia::render('admin/perfil/Index', [
            'nombre'          => $user->name,
            'email'           => $user->email,
            'tienda_telefono' => Integracion::get('tienda_telefono'),
        ]);
    }

    public function updatePersonal(Request $request, UpdateDatosPersonales $action): RedirectResponse
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:100',
            'password_actual'       => 'nullable|string|required_with:password',
            'password'              => ['nullable', 'confirmed', Password::min(8)],
            'password_confirmation' => 'nullable|string',
        ]);

        if (! empty($data['password_actual'])) {
            if (! Hash::check($data['password_actual'], auth()->user()->password)) {
                return back()->withErrors(['password_actual' => 'La contraseña actual no es correcta.']);
            }
        }

        $action->handle(auth()->user(), $data);

        return back()->with('status', 'Datos personales actualizados.');
    }

    public function updateTienda(Request $request, UpdateDatosTienda $action): RedirectResponse
    {
        $data = $request->validate([
            'tienda_telefono' => 'nullable|string|max:30',
        ]);

        $action->handle($data);

        return back()->with('status', 'Datos de la tienda actualizados.');
    }
}
