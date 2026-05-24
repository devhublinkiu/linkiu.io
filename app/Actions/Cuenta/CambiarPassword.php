<?php

namespace App\Actions\Cuenta;

use App\Models\Client;
use Illuminate\Support\Facades\Hash;

class CambiarPassword
{
    /**
     * Valida la contraseña actual y, si es correcta, persiste la nueva.
     * Retorna true en éxito; false si la contraseña actual no coincide.
     * El hashing es automático por el cast 'hashed' del modelo Client.
     */
    public function execute(Client $cliente, string $passwordActual, string $passwordNueva): bool
    {
        if (! Hash::check($passwordActual, $cliente->password)) {
            return false;
        }

        $cliente->update(['password' => $passwordNueva]);

        return true;
    }
}
