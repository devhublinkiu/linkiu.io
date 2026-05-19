<?php

namespace App\Actions\Usuarios;

use App\Mail\InvitacionUsuarioMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
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

        $usuario = User::create([
            'name'       => $datos['name'],
            'username'   => $datos['username'],
            'email'      => $datos['email'],
            'phone'      => $this->normalizarTelefono($datos['phone']),
            'gender'     => $datos['gender'],
            'birthdate'  => $datos['birthdate'] ?? null,
            'country'    => $datos['country'] ?? null,
            'department' => $datos['department'] ?? null,
            'city'       => $datos['city'] ?? null,
            'role'       => 'admin',
            'password'   => Str::random(32),
        ]);

        $usuario->assignRole($rol);

        $token = Str::uuid()->toString();

        cache()->put("invitation_{$token}", [
            'user_id' => $usuario->id,
            'email'   => $usuario->email,
        ], now()->addHours(48));

        Mail::mailer('resend_accounts')
            ->to($usuario->email)
            ->send(new InvitacionUsuarioMail($usuario, $token));

        return ['ok' => true, 'usuario' => $usuario];
    }

    private function normalizarTelefono(string $telefono): string
    {
        $digitos = preg_replace('/\D/', '', $telefono);

        // Ya viene con código de país 57 (ej: 573001234567)
        if (strlen($digitos) === 12 && str_starts_with($digitos, '57')) {
            return '+' . $digitos;
        }

        // Número colombiano de 10 dígitos (ej: 3001234567)
        return '+57' . $digitos;
    }
}
