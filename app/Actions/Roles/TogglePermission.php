<?php

namespace App\Actions\Roles;

use Spatie\Permission\Models\Role;

class TogglePermission
{
    public function execute(Role $role, string $permiso): array
    {
        if ($role->name === 'super-admin') {
            return ['error' => 'rol_no_editable'];
        }

        if ($role->hasPermissionTo($permiso)) {
            $role->revokePermissionTo($permiso);
            return ['ok' => true, 'activo' => false];
        }

        $role->givePermissionTo($permiso);
        return ['ok' => true, 'activo' => true];
    }
}
