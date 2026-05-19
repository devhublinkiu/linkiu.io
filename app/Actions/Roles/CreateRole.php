<?php

namespace App\Actions\Roles;

use Spatie\Permission\Models\Role;

class CreateRole
{
    const LIMITE_ROLES_CUSTOM = 6;
    const ROLES_SISTEMA = ['super-admin', 'admin'];

    public function execute(string $nombre): array
    {
        $totalCustom = Role::whereNotIn('name', self::ROLES_SISTEMA)->count();

        if ($totalCustom >= self::LIMITE_ROLES_CUSTOM) {
            return ['error' => 'limite_alcanzado'];
        }

        $nombreNormalizado = strtolower(trim($nombre));

        if (Role::where('name', $nombreNormalizado)->exists()) {
            return ['error' => 'nombre_duplicado'];
        }

        $role = Role::create([
            'name'       => $nombreNormalizado,
            'guard_name' => 'web',
        ]);

        return ['ok' => true, 'role' => $role];
    }
}
