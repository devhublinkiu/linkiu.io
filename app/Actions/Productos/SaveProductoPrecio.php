<?php

namespace App\Actions\Productos;

use App\Models\Producto;

class SaveProductoPrecio
{
    public function execute(array $datos, Producto $producto): void
    {
        $aplicaIva = (bool) ($datos['aplica_iva'] ?? false);

        $producto->update([
            'precio_base'        => $datos['precio_base'],
            'precio_comparacion' => $datos['precio_comparacion'] ?: null,
            'aplica_iva'         => $aplicaIva,
            'iva_porcentaje'     => $aplicaIva ? ($datos['iva_porcentaje'] ?? 0) : 0,
        ]);
    }
}
