<?php

namespace App\Actions\Perfil;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UpdateDatosPersonales
{
    public function handle(User $user, array $data): void
    {
        $user->name = $data['name'];

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();
    }
}
