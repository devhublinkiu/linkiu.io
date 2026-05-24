<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Usuarios\CreateAdminUser;
use App\Actions\Usuarios\DeleteAdminUser;
use App\Actions\Usuarios\ReenviarInvitacionUsuario;
use App\Http\Controllers\Controller;
use App\Http\Requests\Usuarios\StoreAdminUserRequest;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AdminUsersController extends Controller
{
    public function index()
    {
        abort_if(! auth()->user()->can('usuarios.ver'), 403);

        $usuarios = User::with('roles')
            ->where('role', 'admin')
            ->orderByRaw("CASE WHEN email_verified_at IS NULL THEN 1 ELSE 0 END")
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'username'   => $u->username,
                'email'      => $u->email,
                'rol'        => Str::title(str_replace('-', ' ', $u->roles->first()?->name ?? '')),
                'is_super'   => $u->hasRole('super-admin'),
                'pendiente'  => is_null($u->email_verified_at),
                'created_at' => $u->created_at->format('d/m/Y'),
            ]);

        $roles = Role::whereNotIn('name', ['super-admin'])
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Role $role) => [
                'id'           => $role->id,
                'display_name' => Str::title(str_replace('-', ' ', $role->name)),
            ]);

        return Inertia::render('admin/usuarios/Index', [
            'usuarios' => $usuarios,
            'roles'    => $roles,
        ]);
    }

    public function store(StoreAdminUserRequest $request, CreateAdminUser $action)
    {
        abort_if(! auth()->user()->can('usuarios.crear'), 403);

        $resultado = $action->execute($request->validated());

        if (isset($resultado['error'])) {
            return back()->withErrors(['general' => 'No se pudo crear el usuario.']);
        }

        return back()->with('status', 'Usuario creado. Se envió la invitación por correo.');
    }

    public function reenviar(User $user, ReenviarInvitacionUsuario $action)
    {
        abort_if(! auth()->user()->can('usuarios.crear'), 403);

        $resultado = $action->execute($user);

        if (isset($resultado['error']) && $resultado['error'] === 'ya_verificado') {
            return back()->withErrors(['general' => 'El usuario ya verificó su correo.']);
        }

        return back()->with('status', 'Invitación reenviada correctamente.');
    }

    public function destroy(User $user, DeleteAdminUser $action)
    {
        abort_if(! auth()->user()->can('usuarios.eliminar'), 403);

        $resultado = $action->execute($user);

        if (isset($resultado['error'])) {
            $mensaje = match ($resultado['error']) {
                'no_puedes_eliminarte'         => 'No puedes eliminar tu propia cuenta.',
                'no_puedes_eliminar_superadmin' => 'No se puede eliminar al super-admin.',
                default                         => 'No se pudo eliminar el usuario.',
            };

            return back()->withErrors(['general' => $mensaje]);
        }

        return back()->with('status', 'Usuario eliminado correctamente.');
    }
}
