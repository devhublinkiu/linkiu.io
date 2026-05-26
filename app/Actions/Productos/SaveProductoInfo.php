<?php

namespace App\Actions\Productos;

use App\Models\Producto;
use Illuminate\Support\Str;
use Mews\Purifier\Facades\Purifier;
use RuntimeException;

class SaveProductoInfo
{
    private const SKU_MAX_INTENTOS = 10;

    public function execute(array $datos, ?Producto $producto = null): Producto
    {
        $datos['sku'] = $datos['sku'] ?: $this->generarSku();

        // La descripción ahora es HTML enriquecido (RichTextEditor). Saneamos con
        // HTMLPurifier para permitir solo etiquetas básicas y bloquear XSS.
        if (! empty($datos['descripcion'])) {
            $datos['descripcion'] = Purifier::clean($datos['descripcion']);
        }

        if ($producto) {
            $producto->update($datos);
            return $producto;
        }

        return Producto::create($datos);
    }

    private function generarSku(): string
    {
        for ($i = 0; $i < self::SKU_MAX_INTENTOS; $i++) {
            $sku = 'PRD-' . strtoupper(Str::random(8));
            if (! Producto::where('sku', $sku)->exists()) {
                return $sku;
            }
        }

        throw new RuntimeException(
            'No se pudo generar un SKU único tras ' . self::SKU_MAX_INTENTOS . ' intentos.'
        );
    }
}
