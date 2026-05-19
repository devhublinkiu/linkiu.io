<?php

namespace App\Actions\Usuarios;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

class DeleteAdminUser
{
    public function execute(User $usuario): array
    {
        if ($usuario->id === Auth::id()) {
            return ['error' => 'no_puedes_eliminarte'];
        }

        if ($usuario->hasRole('super-admin')) {
            return ['error' => 'no_puedes_eliminar_superadmin'];
        }

        $usuario->delete();

        return ['ok' => true];
    }
}
