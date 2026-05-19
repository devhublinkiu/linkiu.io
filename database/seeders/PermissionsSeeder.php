<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $modulos = config('permissions');

        // Crear permisos de cada módulo
        foreach ($modulos as $modulo => $config) {
            foreach (array_keys($config['actions']) as $accion) {
                Permission::firstOrCreate([
                    'name'       => "{$modulo}.{$accion}",
                    'guard_name' => 'web',
                ]);
            }
        }

        // El super-admin siempre tiene todos los permisos
        $superAdmin = Role::where('name', 'super-admin')->first();
        if ($superAdmin) {
            $superAdmin->syncPermissions(Permission::all());
        }
    }
}
