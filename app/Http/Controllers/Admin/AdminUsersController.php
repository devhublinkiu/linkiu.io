<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Usuarios\CreateAdminUser;
use App\Actions\Usuarios\DeleteAdminUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\Usuarios\StoreAdminUserRequest;
use App\Mail\InvitacionUsuarioMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AdminUsersController extends Controller
{
    public function index()
    {
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
        $resultado = $action->execute($request->validated());

        if (isset($resultado['error'])) {
            return back()->withErrors(['general' => 'No se pudo crear el usuario.']);
        }

        return back()->with('status', 'Usuario creado. Se enviÃ³ la invitaciÃ³n por correo.');
    }

    public function reenviar(User $user)
    {
        if (! is_null($user->email_verified_at)) {
            return back()->withErrors(['general' => 'El usuario ya verificÃ³ su correo.']);
        }

        $token = Str::uuid()->toString();

        cache()->put("invitation_{$token}", [
            'user_id' => $user->id,
            'email'   => $user->email,
        ], now()->addHours(48));

        Mail::mailer('resend_accounts')
            ->to($user->email)
            ->send(new InvitacionUsuarioMail($user, $token));

        return back()->with('status', 'InvitaciÃ³n reenviada correctamente.');
    }

    public function destroy(User $user, DeleteAdminUser $action)
    {
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
