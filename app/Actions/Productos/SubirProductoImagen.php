<?php

namespace App\Actions\Productos;

use App\Models\Producto;
use App\Models\ProductoImagen;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

class SubirProductoImagen
{
    public function execute(UploadedFile $archivo, Producto $producto): ProductoImagen
    {
        $manager = new ImageManager(new Driver());

        $webp = $manager->decode($archivo)
            ->scaleDown(width: 1600)
            ->encode(new WebpEncoder(quality: 85));

        $ruta = "productos/{$producto->id}/" . Str::uuid() . '.webp';

        Storage::disk('s3')->put($ruta, (string) $webp);

        $esPrincipal = $producto->imagenes()->doesntExist();

        return $producto->imagenes()->create([
            'ruta'      => $ruta,
            'principal' => $esPrincipal,
            'orden'     => $producto->imagenes()->count(),
        ]);
    }
}
