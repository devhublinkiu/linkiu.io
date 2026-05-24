<?php

namespace App\Actions\Roles;

use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

class TogglePermission
{
    /**
     * Permisos que solo el super-admin puede tocar.
     *
     * Sin esta lista, un admin con `roles.editar` podía otorgarse a sí
     * mismo (vía un rol custom) los permisos `usuarios.*` y `roles.*`,
     * volviéndose de facto super-admin (escalación de privilegios).
     *
     * Match por prefijo: bloquea cualquier permiso bajo módulos roles
     * o usuarios para no-super-admins. Permite que super-admin sí los
     * toque (necesario para la configuración inicial del sistema).
     */
    private const PERMISOS_PROTEGIDOS = ['roles.', 'usuarios.'];

    public function execute(Role $role, string $permiso): array
    {
        if ($role->name === 'super-admin') {
            return ['error' => 'rol_no_editable'];
        }

        if (! $this->puedeTocarse($permiso)) {
            return ['error' => 'permiso_protegido'];
        }

        if ($role->hasPermissionTo($permiso)) {
            $role->revokePermissionTo($permiso);
            return ['ok' => true, 'activo' => false];
        }

        $role->givePermissionTo($permiso);
        return ['ok' => true, 'activo' => true];
    }

    /**
     * Helper público para que el frontend (vía controller) sepa qué
     * permisos están bloqueados para el usuario actual y los renderice
     * disabled sin necesidad de intentar el toggle.
     */
    public static function esPermisoProtegido(string $permiso): bool
    {
        foreach (self::PERMISOS_PROTEGIDOS as $prefijo) {
            if (str_starts_with($permiso, $prefijo)) return true;
        }
        return false;
    }

    private function puedeTocarse(string $permiso): bool
    {
        if (Auth::user()->hasRole('super-admin')) {
            return true;
        }

        return ! self::esPermisoProtegido($permiso);
    }
}
