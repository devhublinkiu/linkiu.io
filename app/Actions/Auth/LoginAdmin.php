<?php

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class LoginAdmin
{
    // Intentos antes de bloquear y tiempos progresivos en minutos
    const INTENTOS_MAX = 5;
    const TIEMPOS_BLOQUEO = [5, 15, 60];

    public function execute(string $email, string $password, bool $recordar = false): array
    {
        $usuario = User::where('email', $email)->where('role', 'admin')->first();

        if (! $usuario) {
            return ['error' => 'credenciales_invalidas'];
        }

        if ($usuario->estaBloqueado()) {
            return [
                'error'         => 'cuenta_bloqueada',
                'bloqueado_hasta' => $usuario->blocked_until,
            ];
        }

        if (! Hash::check($password, $usuario->password)) {
            return $this->registrarIntentoFallido($usuario);
        }

        // Login exitoso — resetear intentos
        $usuario->update(['login_attempts' => 0, 'blocked_until' => null]);
        Auth::login($usuario, $recordar);

        return ['ok' => true];
    }

    private function registrarIntentoFallido(User $usuario): array
    {
        $intentos = $usuario->login_attempts + 1;

        if ($intentos >= self::INTENTOS_MAX) {
            $vecesBlockeado = (int) floor($intentos / self::INTENTOS_MAX);
            $indice = min($vecesBlockeado - 1, count(self::TIEMPOS_BLOQUEO) - 1);
            $minutos = self::TIEMPOS_BLOQUEO[$indice];

            $bloqueadoHasta = Carbon::now()->addMinutes($minutos);
            $usuario->update([
                'login_attempts' => $intentos,
                'blocked_until'  => $bloqueadoHasta,
            ]);

            return [
                'error'           => 'cuenta_bloqueada',
                'bloqueado_hasta' => $bloqueadoHasta,
                'minutos'         => $minutos,
            ];
        }

        $usuario->update(['login_attempts' => $intentos]);

        return [
            'error'             => 'credenciales_invalidas',
            'intentos_restantes' => self::INTENTOS_MAX - $intentos,
        ];
    }
}
