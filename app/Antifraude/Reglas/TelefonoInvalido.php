<?php

namespace App\Antifraude\Reglas;

use App\Models\Order;
use App\Services\MastershopService;

/**
 * Detecta teléfonos que no cumplen el formato esperado de Colombia (10 dígitos
 * que empiezan con 3, ej. 3001234567). Si la regla tiene `usar_mastershop=true`
 * y hay API key configurada, también consulta el endpoint validate-phone-number
 * de Mastershop como segunda capa (best effort — si falla, vale el regex).
 */
class TelefonoInvalido implements Regla
{
    public function __construct(private readonly MastershopService $mastershop) {}

    public function clave(): string
    {
        return 'telefono_invalido';
    }

    public function evaluar(Order $orden, ?array $parametros): bool
    {
        $telefono = preg_replace('/\D+/', '', (string) $orden->telefono);

        // Regex Colombia: 10 dígitos empezando por 3. Si el formato base es
        // inválido, no consultamos Mastershop — ahorra rate limit.
        if (! preg_match('/^3\d{9}$/', $telefono)) {
            return true;
        }

        // Validación opcional vía Mastershop. Si la API key no está, validarTelefono
        // devuelve null y NO marcamos el teléfono como inválido (no podemos asegurarlo).
        if (! empty($parametros['usar_mastershop'])) {
            $valido = $this->mastershop->validarTelefono($telefono);
            if ($valido === false) {
                return true;
            }
        }

        return false;
    }
}
