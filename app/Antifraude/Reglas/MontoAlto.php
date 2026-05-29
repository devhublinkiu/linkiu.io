<?php

namespace App\Antifraude\Reglas;

use App\Models\Order;

/**
 * Detecta órdenes con total por encima del umbral configurado. En COD
 * (contraentrega) los pedidos de alto monto son más costosos cuando se
 * pierden — el admin quiere revisarlos antes de despachar.
 */
class MontoAlto implements Regla
{
    public function clave(): string
    {
        return 'monto_alto';
    }

    public function evaluar(Order $orden, ?array $parametros): bool
    {
        $umbral = (int) ($parametros['umbral'] ?? 400000);
        return $orden->total > $umbral;
    }
}
