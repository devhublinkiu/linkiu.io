<?php

namespace App\Actions\Productos;

use App\Models\ProductoImagen;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EliminarProductoImagen
{
    public function execute(ProductoImagen $imagen): void
    {
        $eraPrincipal = $imagen->principal;
        $productoId   = $imagen->producto_id;
        $ruta         = $imagen->ruta;

        // BD primero: si falla la promoción, todo rollback y S3 queda intacto.
        DB::transaction(function () use ($imagen, $eraPrincipal, $productoId) {
            $imagen->delete();

            if ($eraPrincipal) {
                ProductoImagen::where('producto_id', $productoId)
                    ->orderBy('orden')
                    ->first()?->update(['principal' => true]);
            }
        });

        // Tras commit exitoso, eliminar el archivo en S3.
        Storage::disk('s3')->delete($ruta);
    }
}
