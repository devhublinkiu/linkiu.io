<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Roles\CreateRole;
use App\Actions\Roles\DeleteRole;
use App\Actions\Roles\TogglePermission;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesController extends Controller
{
    public function index(): Response
    {
        abort_if(! auth()->user()->can('roles.ver'), 403);

        $modulos        = config('permissions');
        $todosPermisos  = Permission::pluck('name')->toArray();
        // withCount('users') evita N+1 (antes: 1 query por cada $role->users()->count())
        $rolesOrdenados = Role::withCount('users')->get()->sortBy(fn ($r) => match ($r->name) {
            'super-admin' => 0,
            'admin'       => 1,
            default       => 2,
        })->values();

        $roles = $rolesOrdenados->map(fn (Role $role) => [
            'id'           => $role->id,
            'name'         => $role->name,
            'display_name' => Str::title(str_replace('-', ' ', $role->name)),
            'is_super'     => $role->name === 'super-admin',
            'is_system'    => in_array($role->name, ['super-admin', 'admin']),
            'users_count'  => $role->users_count,
            'permissions'  => $role->name === 'super-admin'
                ? $todosPermisos
                : $role->getPermissionNames()->toArray(),
        ]);

        return Inertia::render('admin/roles/Index', [
            'modulos'       => $modulos,
            'roles'         => $roles,
            'total_custom'  => Role::whereNotIn('name', ['super-admin', 'admin'])->count(),
            'limite'        => CreateRole::LIMITE_ROLES_CUSTOM,
        ]);
    }

    public function store(Request $request, CreateRole $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('roles.crear'), 403);

        $request->validate([
            'nombre' => 'required|string|max:50',
        ]);

        $resultado = $action->execute($request->nombre);

        if (isset($resultado['error'])) {
            $mensaje = match ($resultado['error']) {
                'limite_alcanzado' => 'Se alcanzó el límite de roles personalizados.',
                'nombre_duplicado' => 'Ya existe un rol con ese nombre.',
                default            => 'No se pudo crear el rol.',
            };
            return back()->withErrors(['nombre' => $mensaje]);
        }

        return back()->with('status', 'Rol creado correctamente.');
    }

    public function togglePermission(Request $request, Role $role, TogglePermission $action): JsonResponse
    {
        abort_if(! auth()->user()->can('roles.editar'), 403);

        $request->validate([
            'permiso' => 'required|string|exists:permissions,name',
        ]);

        $resultado = $action->execute($role, $request->permiso);

        if (isset($resultado['error'])) {
            $mensaje = match ($resultado['error']) {
                'rol_no_editable'   => 'No se puede editar el rol super-admin.',
                'permiso_protegido' => 'Solo el super-admin puede modificar permisos del módulo Roles o Usuarios.',
                default             => $resultado['error'],
            };
            return response()->json(['error' => $mensaje], 403);
        }

        return response()->json(['ok' => true, 'activo' => $resultado['activo']]);
    }

    public function destroy(Role $role, DeleteRole $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('roles.eliminar'), 403);

        $resultado = $action->execute($role);

        if (isset($resultado['error'])) {
            $mensaje = match ($resultado['error']) {
                'rol_sistema'    => 'No se puede eliminar un rol del sistema.',
                'tiene_usuarios' => 'No se puede eliminar un rol con usuarios asignados.',
                default          => 'No se pudo eliminar el rol.',
            };
            return back()->withErrors(['role' => $mensaje]);
        }

        return back()->with('status', 'Rol eliminado correctamente.');
    }
}
