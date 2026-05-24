<?php

namespace App\Actions\Usuarios;

use App\Jobs\EnviarInvitacionUsuarioJob;
use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class CreateAdminUser
{
    public function execute(array $datos): array
    {
        $rol = Role::find($datos['role_id']);

        if (! $rol) {
            return ['error' => 'rol_no_encontrado'];
        }

        // Defense in depth: el FormRequest ya filtra super-admin pero
        // validamos también aquí por si la Action se invoca desde otro
        // lugar sin pasar por el FormRequest.
        if ($rol->name === 'super-admin') {
            return ['error' => 'rol_no_asignable'];
        }

        $token = Str::random(64);

        $usuario = DB::transaction(function () use ($datos, $rol, $token) {
            $usuario = User::create([
                'name'       => $datos['name'],
                'username'   => $datos['username'],
                'email'      => $datos['email'],
                'phone'      => $this->normalizarTelefono($datos['phone']),
                'gender'     => $datos['gender'],
                'birthdate'  => $datos['birthdate']  ?? null,
                'country'    => $datos['country']    ?? null,
                'department' => $datos['department'] ?? null,
                'city'       => $datos['city']       ?? null,
                'role'       => 'admin',
                'password'   => Str::random(32),
            ]);

            $usuario->assignRole($rol);

            UserInvitation::create([
                'token'      => $token,
                'user_id'    => $usuario->id,
                'email'      => $usuario->email,
                'expires_at' => now()->addHours(48),
            ]);

            return $usuario;
        });

        EnviarInvitacionUsuarioJob::dispatch($usuario, $token);

        return ['ok' => true, 'usuario' => $usuario];
    }

    private function normalizarTelefono(string $telefono): string
    {
        $digitos = preg_replace('/\D/', '', $telefono);

        if (strlen($digitos) === 12 && str_starts_with($digitos, '57')) {
            return '+' . $digitos;
        }

        return '+57' . $digitos;
    }
}
