<?php

namespace App\Actions\Productos;

use App\Models\Producto;
use Illuminate\Support\Str;

class SaveProductoInfo
{
    public function execute(array $datos, ?Producto $producto = null): Producto
    {
        $datos['sku'] = $datos['sku'] ?: $this->generarSku();

        if ($producto) {
            $producto->update($datos);
            return $producto;
        }

        return Producto::create($datos);
    }

    private function generarSku(): string
    {
        do {
            $sku = 'PRD-' . strtoupper(Str::random(8));
        } while (Producto::where('sku', $sku)->exists());

        return $sku;
    }
}
