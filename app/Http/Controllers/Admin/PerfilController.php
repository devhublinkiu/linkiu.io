<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Perfil\UpdateDatosPersonales;
use App\Http\Controllers\Controller;
use App\Http\Requests\Perfil\UpdatePerfilPersonalRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PerfilController extends Controller
{
    public function show(): Response
    {
        abort_if(! auth()->user()->can('perfil.ver'), 403);

        $user = auth()->user();

        return Inertia::render('admin/perfil/Index', [
            'nombre' => $user->name,
            'email'  => $user->email,
        ]);
    }

    public function updatePersonal(UpdatePerfilPersonalRequest $request, UpdateDatosPersonales $action): RedirectResponse
    {
        // authorize() del FormRequest valida el permiso (perfil.editar).
        // Validación de current_password vive en las reglas del FormRequest.
        $action->handle(auth()->user(), $request->validated());

        return back()->with('status', 'Datos personales actualizados.');
    }
}
