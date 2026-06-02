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

                // Persistimos dimensiones reales del WebP para que el frontend
                // pueda renderizar el <img> con width/height correctos y evitar
                // CLS. El ratio del logo varía por tenant (no es cuadrado).
                $dims = $this->leerDimensiones($resultado['ruta']);
                if ($dims) {
                    BuildConfig::set("build_logo_{$slot}_w", (string) $dims['w']);
                    BuildConfig::set("build_logo_{$slot}_h", (string) $dims['h']);
                }
            }

            if (! empty($data["eliminar_{$slot}"])) {
                if ($rutaActual) {
                    Storage::disk('s3')->delete($rutaActual);
                    BuildImageUpload::olvidar($rutaActual);
                }
                BuildConfig::set("build_logo_{$slot}", null);
                BuildConfig::set("build_logo_{$slot}_w", null);
                BuildConfig::set("build_logo_{$slot}_h", null);
            }
        }
    }

    /**
     * Lee el WebP recien subido de S3 y devuelve sus dimensiones.
     * Devuelve null si falla — no es bloqueante: el frontend cae al fallback.
     */
    private function leerDimensiones(string $ruta): ?array
    {
        try {
            $contenido = Storage::disk('s3')->get($ruta);
            if (! $contenido) return null;

            $info = getimagesizefromstring($contenido);
            if (! $info || ! isset($info[0], $info[1])) return null;

            return ['w' => (int) $info[0], 'h' => (int) $info[1]];
        } catch (\Throwable) {
            return null;
        }
    }
}
