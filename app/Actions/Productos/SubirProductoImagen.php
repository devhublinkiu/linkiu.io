<?php

namespace App\Actions\Productos;

use App\Actions\Build\SubirImagenWebp;
use App\Models\Producto;
use App\Models\ProductoImagen;
use Illuminate\Http\UploadedFile;

class SubirProductoImagen
{
    public function __construct(private SubirImagenWebp $subir)
    {
    }

    public function execute(UploadedFile $archivo, Producto $producto): ProductoImagen
    {
        ['ruta' => $ruta] = $this->subir->execute(
            archivo:  $archivo,
            carpeta:  "productos/{$producto->id}",
            anchoMax: 1600,
            track:    false,
        );

        $esPrincipal = $producto->imagenes()->doesntExist();

        return $producto->imagenes()->create([
            'ruta'      => $ruta,
            'principal' => $esPrincipal,
            'orden'     => $producto->imagenes()->count(),
        ]);
    }
}
