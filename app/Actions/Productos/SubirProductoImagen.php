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
        // 1200px cubre mobile DPR 2 (display ~662 × 2 = 1324) con escala minima
        // imperceptible y desktop con margen. Antes 1600 era 1.2x oversize en
        // DPR 2 (el grueso del mercado) — PageSpeed lo flageaba.
        ['ruta' => $ruta] = $this->subir->execute(
            archivo:  $archivo,
            carpeta:  "productos/{$producto->id}",
            anchoMax: 1200,
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
