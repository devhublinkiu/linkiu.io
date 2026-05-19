<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Roles
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'admin',       'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'operador',    'guard_name' => 'web']);

        // Super-admin (primer usuario de la plataforma)
        $usuario = User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'ops@linkiu.bio')],
            [
                'name'              => 'Super Admin',
                'password'          => Hash::make(env('ADMIN_PASSWORD', 'password')),
                'role'              => 'admin',
                'phone'             => env('ADMIN_PHONE', '573233332112'),
                'email_verified_at' => now(),
            ]
        );

        $usuario->assignRole($superAdmin);
    }
}
