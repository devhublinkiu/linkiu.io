<?php

namespace App\Actions\Productos;

use App\Models\VariableGrupo;
use App\Models\VariableItem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

class CrearVariableItem
{
    public function execute(array $datos, VariableGrupo $grupo, ?UploadedFile $imagen = null): VariableItem
    {
        $orden = $grupo->items()->max('orden') + 1;
        $valor = $datos['valor'] ?? null;

        if ($grupo->tipo === 'imagen' && $imagen) {
            $manager = new ImageManager(new Driver());
            $webp    = $manager->decode($imagen)
                ->scaleDown(width: 800)
                ->encode(new WebpEncoder(quality: 85));

            $valor = "productos/{$grupo->producto_id}/variables/{$grupo->id}/" . Str::uuid() . '.webp';
            Storage::disk('s3')->put($valor, (string) $webp);
        }

        return $grupo->items()->create([
            'nombre'        => $datos['nombre'],
            'valor'         => $valor,
            'precio_ajuste' => $datos['precio_ajuste'] ?? null,
            'activo'        => true,
            'orden'         => $orden,
        ]);
    }
}
