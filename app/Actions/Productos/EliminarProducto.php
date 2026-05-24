<?php

namespace App\Actions\Productos;

use App\Models\Producto;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Elimina un producto y todos sus assets en S3.
 *
 * Estrategia:
 * 1. Recolecta TODAS las rutas S3 bajo "productos/{id}/" (cubre imágenes
 *    principales, hooks con imagen y variables tipo imagen, sin tener que
 *    conocer el shape interno de cada hook config).
 * 2. Borra el producto dentro de DB::transaction — las FK con cascadeOnDelete
 *    limpian producto_cantidades, producto_imagenes, producto_hooks,
 *    variable_grupos y variable_items.
 * 3. Solo tras commit exitoso borra los archivos en S3 en un batch.
 *    Si el batch S3 falla, el log queda pero la BD ya está consistente
 *    (los archivos huérfanos se pueden limpiar después con un comando).
 */
class EliminarProducto
{
    public function execute(Producto $producto): void
    {
        $rutas = Storage::disk('s3')->allFiles("productos/{$producto->id}");

        DB::transaction(function () use ($producto) {
            $producto->delete();
        });

        if (! empty($rutas)) {
            Storage::disk('s3')->delete($rutas);
        }
    }
}
