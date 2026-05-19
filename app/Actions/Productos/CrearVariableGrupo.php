<?php

namespace App\Actions\Productos;

use App\Models\Producto;
use App\Models\VariableGrupo;

class CrearVariableGrupo
{
    public function execute(array $datos, Producto $producto): VariableGrupo
    {
        $orden = $producto->variableGrupos()->max('orden') + 1;

        return $producto->variableGrupos()->create([
            'nombre' => $datos['nombre'],
            'tipo'   => $datos['tipo'],
            'orden'  => $orden,
        ]);
    }
}
