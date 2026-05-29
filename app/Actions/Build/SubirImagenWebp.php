<?php

namespace App\Actions\Build;

use App\Models\BuildImageUpload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

/**
 * Convierte cualquier imagen permitida a WebP, la escala al ancho máximo dado
 * y la guarda en el bucket S3 bajo la carpeta indicada.
 *
 * Cuando $track = true (default), registra el upload en build_image_uploads
 * como huérfano hasta que un save de config lo marque como adjunto. El cron
 * build:limpiar-huerfanas lo elimina tras el periodo de gracia.
 *
 * Otros módulos (Productos, etc.) que mantienen su propio ciclo de vida de
 * imágenes en sus tablas (producto_imagenes, variable_items) deben pasar
 * $track = false para evitar que el cron de Build borre sus archivos.
 *
 * Retorna ['url' => string, 'ruta' => string]. La ruta es la que debe persistirse;
 * la URL es para mostrar el preview inmediato en el frontend.
 */
class SubirImagenWebp
{
    public const ANCHO_THUMB = 200;

    public function execute(UploadedFile $archivo, string $carpeta, int $anchoMax, bool $track = true): array
    {
        $manager = new ImageManager(new Driver());

        // Decodificamos una sola vez; reutilizamos para las dos variantes.
        $imagen = $manager->decode($archivo);

        // Quality 80 da imágenes ~70% más livianas que 92 sin pérdida visible
        // en thumbnails ni en fotos de producto. PageSpeed Insights lo agradece.
        $webp = (clone $imagen)
            ->scaleDown(width: $anchoMax)
            ->encode(new WebpEncoder(quality: 80));

        // Thumb 200px de ancho para miniaturas (galería, cards, etc.). El consumer
        // del frontend deriva la URL agregando _thumb antes de la extensión.
        // PageSpeed flagea sobredimensión cuando una imagen de 1254px se muestra
        // a 64-105px — los thumbs resuelven ese flag.
        $thumb = (clone $imagen)
            ->scaleDown(width: self::ANCHO_THUMB)
            ->encode(new WebpEncoder(quality: 80));

        $uuid      = Str::uuid();
        $ruta      = "{$carpeta}/{$uuid}.webp";
        $rutaThumb = "{$carpeta}/{$uuid}_thumb.webp";

        // CacheControl + ContentType: PageSpeed flagea cualquier asset estático
        // sin cache eficiente. 1 año immutable es seguro porque cada upload
        // genera un UUID nuevo (cambia la URL si se reemplaza la imagen).
        $opciones = [
            'CacheControl' => 'public, max-age=31536000, immutable',
            'ContentType'  => 'image/webp',
        ];

        Storage::disk('s3')->put($ruta,      (string) $webp,  $opciones);
        Storage::disk('s3')->put($rutaThumb, (string) $thumb, $opciones);

        if ($track) {
            BuildImageUpload::registrar($ruta, auth()->id());
        }

        return [
            'url'  => Storage::disk('s3')->url($ruta),
            'ruta' => $ruta,
        ];
    }
}
