<?php

namespace App\Actions\Productos;

use App\Actions\Build\SubirImagenWebp;
use App\Models\Producto;
use Illuminate\Http\UploadedFile;

class SubirProductoHookImagen
{
    public function __construct(private SubirImagenWebp $subir)
    {
    }

    public function execute(UploadedFile $archivo, Producto $producto, string $hook): array
    {
        // track: true → registra en build_image_uploads. El cron diario
        // LimpiarHuerfanasBuild borra imágenes que llevan >24h tracked
        // pero sin asociación a un hook activo (subidas y descartadas).
        // Mismo criterio que SubirProductoImagen — 1200 cubre mobile DPR 2 sin
        // sobre-pesar el bundle de imagenes.
        return $this->subir->execute(
            archivo:  $archivo,
            carpeta:  "productos/{$producto->id}/hooks/{$hook}",
            anchoMax: 1200,
            track:    true,
        );
    }
}
