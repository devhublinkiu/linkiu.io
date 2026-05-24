<?php

namespace App\Actions\Perfil;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UpdateDatosPersonales
{
    /**
     * Actualiza nombre y opcionalmente password del admin.
     *
     * Si cambia la password:
     *  - Hashea con bcrypt (Hash::make).
     *  - Invalida TODAS las otras sesiones del usuario (Auth::logoutOtherDevices).
     *    Esto cierra el riesgo de cookie robada: si un atacante tiene una cookie
     *    de sesión robada y la víctima cambia su password, la cookie del atacante
     *    queda invalidada inmediatamente. La sesión actual (la que está cambiando
     *    la password) se mantiene viva con el nuevo hash.
     *
     * La verificación de password_actual vive en UpdatePerfilPersonalRequest
     * (regla `current_password`) — la Action confía en que el FormRequest ya
     * validó. Si esta Action se llama directo sin FormRequest (tinker/seeders),
     * el caller es responsable de validar antes.
     *
     * @param  array{name: string, password?: ?string}  $data
     */
    public function handle(User $user, array $data): void
    {
        $user->name = $data['name'];

        $cambioPassword = ! empty($data['password']);

        if ($cambioPassword) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        if ($cambioPassword) {
            // logoutOtherDevices necesita la NUEVA password en plain text para
            // recomputar el password_hash del session payload — Laravel revoca
            // todas las sesiones cuyo hash no coincida (todas excepto la actual).
            Auth::logoutOtherDevices($data['password']);
        }
    }
}
