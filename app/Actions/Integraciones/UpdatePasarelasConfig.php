<?php

namespace App\Actions\Integraciones;

use App\Models\Integracion;
use App\Models\IntegracionAudit;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class UpdatePasarelasConfig
{
    /**
     * Claves consideradas "secretas" para efectos de audit log.
     * Mantener sincronizada con `Integracion::CLAVES_SECRETAS`.
     */
    private const CLAVES_AUDITABLES = [
        'mp_access_token_sandbox',
        'mp_access_token_prod',
        'mp_webhook_secret',
        'bold_identity_key',
        'bold_secret_key',
    ];

    private const CLAVES_TEXTO = [
        'mp_access_token_sandbox',
        'mp_public_key_sandbox',
        'mp_access_token_prod',
        'mp_public_key_prod',
        'mp_webhook_secret',
        'bold_identity_key',
        'bold_secret_key',
    ];

    // Sentinel para "no modificar el token actual" — UI lo manda cuando hay
    // un valor guardado y el admin no tocó el campo.
    private const TOKEN_NO_CAMBIAR = '***';

    public function handle(array $data): void
    {
        // Snapshot del estado actual ANTES de modificar — necesario para
        // detectar transiciones "vacío → configurado" en el audit log.
        $estadoAnterior = $this->snapshotConfiguradas();

        foreach (self::CLAVES_TEXTO as $clave) {
            $valor = $data[$clave] ?? null;
            // Respetar el sentinel: no tocar valor guardado si el usuario no lo cambió.
            if ($valor === self::TOKEN_NO_CAMBIAR) {
                continue;
            }
            Integracion::set($clave, $valor ?: null);
        }
        Integracion::set('mp_sandbox', ! empty($data['mp_sandbox']) ? '1' : '0');

        $this->registrarAuditoria($estadoAnterior);
    }

    /**
     * Map [clave => bool] indicando cuáles claves auditables tienen valor
     * antes del cambio. Usa el helper `Integracion::get` (que descifra) y
     * coerciona el resultado a "configurada o no".
     */
    private function snapshotConfiguradas(): array
    {
        $snapshot = [];
        foreach (self::CLAVES_AUDITABLES as $clave) {
            $snapshot[$clave] = ! empty(Integracion::get($clave));
        }
        return $snapshot;
    }

    /**
     * Inserta un row en integraciones_audit por cada clave secreta cuyo
     * estado "configurada/no" cambió. NO se registran cambios donde
     * was_set === is_set (el admin guardó el formulario sin tocar esa
     * clave) para no inundar la tabla.
     */
    private function registrarAuditoria(array $estadoAnterior): void
    {
        $userId = Auth::id();
        $ip     = Request::ip();

        foreach (self::CLAVES_AUDITABLES as $clave) {
            $wasSet = $estadoAnterior[$clave];
            $isSet  = ! empty(Integracion::get($clave));

            // Solo log si hubo cambio real de estado configurada/no.
            if ($wasSet === $isSet) {
                continue;
            }

            IntegracionAudit::create([
                'clave'   => $clave,
                'was_set' => $wasSet,
                'is_set'  => $isSet,
                'user_id' => $userId,
                'ip'      => $ip,
            ]);
        }
    }
}
