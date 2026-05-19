<?php

namespace App\Actions\Roles;

use Spatie\Permission\Models\Role;

class DeleteRole
{
    const ROLES_SISTEMA = ['super-admin', 'admin'];

    public function execute(Role $role): array
    {
        if (in_array($role->name, self::ROLES_SISTEMA)) {
            return ['error' => 'rol_sistema'];
        }

        if ($role->users()->count() > 0) {
            return ['error' => 'tiene_usuarios'];
        }

        $role->delete();

        return ['ok' => true];
    }
}
