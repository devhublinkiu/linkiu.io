<?php

namespace App\Antifraude\Reglas;

use App\Models\Order;

/**
 * Contrato común para las reglas del motor antifraude. Cada regla recibe la
 * orden y sus parámetros (de antifraude_reglas.parametros). Devuelve true
 * cuando la regla DETECTA un motivo de bloqueo.
 *
 * Mantenemos las reglas como clases stateless por simplicidad — no necesitan
 * dependency injection para los casos actuales (la regla de teléfono inyecta
 * MastershopService vía el container).
 */
interface Regla
{
    /**
     * @return bool true si la regla detectó motivo de bloqueo
     */
    public function evaluar(Order $orden, ?array $parametros): bool;

    /**
     * Identificador estable que se persiste en revision_motivos[].
     * Coincide con la columna `clave` de antifraude_reglas.
     */
    public function clave(): string;
}
