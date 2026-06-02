<?php

namespace App\Actions\Build;

use App\Models\BuildConfig;
use App\Models\BuildImageUpload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateLogos
{
    public function __construct(private SubirImagenWebp $subirWebp) {}

    public function handle(array $data): void
    {
        foreach (['tienda', 'admin'] as $slot) {
            $rutaActual = BuildConfig::get("build_logo_{$slot}");

            if (isset($data["logo_{$slot}"]) && $data["logo_{$slot}"] instanceof UploadedFile) {
                if ($rutaActual) {
                    Storage::disk('s3')->delete($rutaActual);
                    BuildImageUpload::olvidar($rutaActual);
                }

                // Convertimos a WebP con SubirImagenWebp para aprovechar la
                // optimización + Cache-Control inmutable. 400px cubre cualquier
                // dispositivo (logo display ~115px, DPR 3 = 345 efectivo).
                // Antes 600 era 1.7-5x oversize segun el DPR.
                $resultado = $this->subirWebp->execute(
                    archivo:  $data["logo_{$slot}"],
                    carpeta:  "logos/{$slot}",
                    anchoMax: 400,
                    track:    false, // logos no son huérfanos — los gestiona BuildConfig
                );

                BuildConfig::set("build_logo_{$slot}", $resultado['ruta']);
            }

            if (! empty($data["eliminar_{$slot}"])) {
                if ($rutaActual) {
                    Storage::disk('s3')->delete($rutaActual);
                    BuildImageUpload::olvidar($rutaActual);
                }
                BuildConfig::set("build_logo_{$slot}", null);
            }
        }
    }
}
