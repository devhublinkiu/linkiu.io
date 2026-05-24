<?php

namespace App\Actions\Productos;

use App\Actions\Build\SubirImagenWebp;
use App\Models\VariableGrupo;
use App\Models\VariableItem;
use Illuminate\Http\UploadedFile;

class CrearVariableItem
{
    public function __construct(private SubirImagenWebp $subir)
    {
    }

    public function execute(array $datos, VariableGrupo $grupo, ?UploadedFile $imagen = null): VariableItem
    {
        $orden = $grupo->items()->max('orden') + 1;
        $valor = $datos['valor'] ?? null;

        if ($grupo->tipo === 'imagen' && $imagen) {
            ['ruta' => $valor] = $this->subir->execute(
                archivo:  $imagen,
                carpeta:  "productos/{$grupo->producto_id}/variables/{$grupo->id}",
                anchoMax: 800,
                track:    false,
            );
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
