<?php

namespace App\Actions\Integraciones;

use App\Models\Integracion;
use App\Models\IntegracionAudit;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Persiste la API key de Mastershop con el patrón sentinel `***` para
 * "no modificar valor actual". Registra audit log en transiciones
 * vacío → configurado y viceversa.
 */
class UpdateMastershopConfig
{
    private const CLAVE = 'mastershop_api_key';

    private const TOKEN_NO_CAMBIAR = '***';

    public function handle(array $data): void
    {
        $estabaConfigurada = ! empty(Integracion::get(self::CLAVE));

        $valor = $data['mastershop_api_key'] ?? null;
        if ($valor === self::TOKEN_NO_CAMBIAR) {
            return;
        }

        Integracion::set(self::CLAVE, $valor ?: null);

        $estaConfigurada = ! empty(Integracion::get(self::CLAVE));

        if ($estabaConfigurada !== $estaConfigurada) {
            IntegracionAudit::create([
                'clave'   => self::CLAVE,
                'was_set' => $estabaConfigurada,
                'is_set'  => $estaConfigurada,
                'user_id' => Auth::id(),
                'ip'      => Request::ip(),
            ]);
        }
    }
}
