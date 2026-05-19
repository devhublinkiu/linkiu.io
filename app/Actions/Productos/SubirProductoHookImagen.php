<?php

namespace App\Actions\Productos;

use App\Models\Producto;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

class SubirProductoHookImagen
{
    public function execute(UploadedFile $archivo, Producto $producto, string $hook): array
    {
        $manager = new ImageManager(new Driver());

        $webp = $manager->decode($archivo)
            ->scaleDown(width: 1600)
            ->encode(new WebpEncoder(quality: 85));

        $ruta = "productos/{$producto->id}/hooks/{$hook}/" . Str::uuid() . '.webp';

        Storage::disk('s3')->put($ruta, (string) $webp);

        return [
            'url'  => Storage::disk('s3')->url($ruta),
            'ruta' => $ruta,
        ];
    }
}
