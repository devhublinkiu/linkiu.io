<?php

namespace App\Actions\Productos;

use App\Models\ProductoImagen;

class MarcarImagenPrincipal
{
    public function execute(ProductoImagen $imagen): void
    {
        ProductoImagen::where('producto_id', $imagen->producto_id)
            ->update(['principal' => false]);

        $imagen->update(['principal' => true]);
    }
}
