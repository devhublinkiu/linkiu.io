<?php

namespace App\Actions\Build;

use App\Models\BuildConfig;
use App\Models\BuildImageUpload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateLogos
{
    public function handle(array $data): void
    {
        foreach (['tienda', 'admin'] as $slot) {
            $rutaActual = BuildConfig::get("build_logo_{$slot}");

            if (isset($data["logo_{$slot}"]) && $data["logo_{$slot}"] instanceof UploadedFile) {
                if ($rutaActual) {
                    Storage::disk('s3')->delete($rutaActual);
                    BuildImageUpload::olvidar($rutaActual);
                }

                $ruta = $data["logo_{$slot}"]->store("logos/{$slot}", 's3');
                BuildConfig::set("build_logo_{$slot}", $ruta);
                BuildImageUpload::registrar($ruta, auth()->id());
                BuildImageUpload::where('ruta', $ruta)->update(['attached' => true]);
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
