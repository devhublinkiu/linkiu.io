<?php

namespace App\Actions\Build;

use App\Models\BuildImageUpload;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

/**
 * Elimina una imagen del bucket S3 bajo una carpeta permitida y limpia
 * su registro en build_image_uploads.
 *
 * Defense in depth: aunque el FormRequest ya valida el prefijo de la ruta,
 * la Action vuelve a comprobar para que sea reutilizable desde jobs,
 * comandos o webhooks sin depender del contexto HTTP.
 */
class EliminarImagenBuild
{
    public function execute(string $ruta, string $carpetaPermitida): void
    {
        if (! str_starts_with($ruta, $carpetaPermitida . '/')) {
            throw new InvalidArgumentException(
                "La ruta '{$ruta}' está fuera de la carpeta permitida '{$carpetaPermitida}/'."
            );
        }

        Storage::disk('s3')->delete($ruta);

        BuildImageUpload::olvidar($ruta);
    }
}
