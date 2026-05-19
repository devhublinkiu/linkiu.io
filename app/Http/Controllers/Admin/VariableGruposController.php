<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Productos\CrearVariableGrupo;
use App\Actions\Productos\EliminarVariableGrupo;
use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\VariableGrupo;
use Illuminate\Http\Request;

class VariableGruposController extends Controller
{
    public function store(Request $request, Producto $producto, CrearVariableGrupo $action)
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'tipo'   => ['required', 'in:color,imagen,texto'],
        ]);

        $grupo = $action->execute($datos, $producto);

        return back()->with('grupo_creado', $grupo->id);
    }

    public function update(Request $request, Producto $producto, VariableGrupo $grupo)
    {
        abort_unless($grupo->producto_id === $producto->id, 403);

        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
        ]);

        $grupo->update(['nombre' => $datos['nombre']]);

        return back();
    }

    public function destroy(Producto $producto, VariableGrupo $grupo, EliminarVariableGrupo $action)
    {
        abort_unless($grupo->producto_id === $producto->id, 403);

        $action->execute($grupo);

        return back();
    }
}
