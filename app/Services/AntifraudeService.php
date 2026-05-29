<?php

namespace App\Services;

use App\Antifraude\Reglas\ClienteBlacklist;
use App\Antifraude\Reglas\MontoAlto;
use App\Antifraude\Reglas\Regla;
use App\Antifraude\Reglas\TelefonoInvalido;
use App\Models\AntifraudeRegla;
use App\Models\Order;

/**
 * Motor antifraude. Carga las reglas configuradas en `antifraude_reglas` y
 * recorre las ACTIVAS contra una orden. Devuelve la lista de motivos detectados.
 *
 * Modo bloqueante: si hay 1+ motivos, el caller debe setear
 * revision_estado='pendiente' y NO procesar la orden hasta que el admin la
 * apruebe explícitamente.
 *
 * Las reglas son instancias resueltas por el container, lo que permite que
 * cada una declare sus dependencias (TelefonoInvalido inyecta MastershopService).
 */
class AntifraudeService
{
    /**
     * Mapa clave → clase. Para agregar una nueva regla:
     *   1. Crear la clase en App\Antifraude\Reglas\NombreRegla implementando Regla
     *   2. Agregar la fila acá
     *   3. Insertar la regla en antifraude_reglas (clave + activa + parametros)
     *   4. (Opcional) UI en página config para activarla/editarla
     */
    private const CLASES_DE_REGLA = [
        'telefono_invalido' => TelefonoInvalido::class,
        'monto_alto'        => MontoAlto::class,
        'cliente_blacklist' => ClienteBlacklist::class,
    ];

    /**
     * Evalúa la orden contra todas las reglas activas.
     *
     * @return string[] Array de claves de regla que dispararon motivo.
     *                  Vacío = sin riesgo (la orden pasa automáticamente).
     */
    public function evaluar(Order $orden): array
    {
        $motivos       = [];
        $reglasDB      = AntifraudeRegla::todasIndexadas();

        foreach (self::CLASES_DE_REGLA as $clave => $clase) {
            $configRegla = $reglasDB->get($clave);

            // Si la regla no está en BD o está desactivada, la salteamos. Esto
            // permite seguir agregando código de reglas sin afectar instalaciones
            // existentes hasta que se corra el seeder.
            if (! $configRegla || ! $configRegla->activa) {
                continue;
            }

            /** @var Regla $regla */
            $regla = app($clase);

            try {
                if ($regla->evaluar($orden, $configRegla->parametros)) {
                    $motivos[] = $regla->clave();
                }
            } catch (\Throwable $e) {
                // Una regla que falla no debe bloquear la orden. Loggeamos y seguimos.
                \Log::warning("Antifraude regla {$clave} excepción", [
                    'orden_id' => $orden->id,
                    'mensaje'  => $e->getMessage(),
                ]);
            }
        }

        return $motivos;
    }
}
