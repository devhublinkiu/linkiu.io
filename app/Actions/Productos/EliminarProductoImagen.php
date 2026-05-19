<?php

namespace App\Actions\Productos;

use App\Models\ProductoImagen;
use Illuminate\Support\Facades\Storage;

class EliminarProductoImagen
{
    public function execute(ProductoImagen $imagen): void
    {
        $eraPrincipal = $imagen->principal;
        $productoId   = $imagen->producto_id;

        Storage::disk('s3')->delete($imagen->ruta);
        $imagen->delete();

        // Si era la principal, promover la siguiente imagen disponible
        if ($eraPrincipal) {
            ProductoImagen::where('producto_id', $productoId)
                ->orderBy('orden')
                ->first()?->update(['principal' => true]);
        }
    }
}
