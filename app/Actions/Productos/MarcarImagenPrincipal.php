<?php

namespace App\Actions\Productos;

use App\Models\ProductoImagen;
use Illuminate\Support\Facades\DB;

class MarcarImagenPrincipal
{
    public function execute(ProductoImagen $imagen): void
    {
        DB::transaction(function () use ($imagen) {
            ProductoImagen::where('producto_id', $imagen->producto_id)
                ->update(['principal' => false]);

            $imagen->update(['principal' => true]);
        });
    }
}
