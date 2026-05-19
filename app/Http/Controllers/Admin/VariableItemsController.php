<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Productos\CrearVariableItem;
use App\Actions\Productos\EliminarVariableItem;
use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\VariableGrupo;
use App\Models\VariableItem;
use Illuminate\Http\Request;

class VariableItemsController extends Controller
{
    public function store(Request $request, Producto $producto, VariableGrupo $grupo, CrearVariableItem $action)
    {
        abort_unless($grupo->producto_id === $producto->id, 403);

        $datos = $request->validate([
            'nombre'        => ['required', 'string', 'max:100'],
            'valor'         => ['nullable', 'string', 'max:20'],
            'precio_ajuste' => ['nullable', 'numeric'],
            'imagen'        => ['nullable', 'image', 'max:10240'],
        ]);

        $item = $action->execute($datos, $grupo, $request->file('imagen'));

        return back()->with('flash', [
            'id'            => $item->id,
            'nombre'        => $item->nombre,
            'valor'         => $item->valor,
            'url'           => $item->url,
            'precio_ajuste' => $item->precio_ajuste,
            'activo'        => $item->activo,
            'orden'         => $item->orden,
        ]);
    }

    public function update(Request $request, Producto $producto, VariableGrupo $grupo, VariableItem $item)
    {
        abort_unless($grupo->producto_id === $producto->id, 403);
        abort_unless($item->grupo_id === $grupo->id, 403);

        $datos = $request->validate([
            'nombre'        => ['required', 'string', 'max:100'],
            'valor'         => ['nullable', 'string', 'max:20'],
            'precio_ajuste' => ['nullable', 'numeric'],
        ]);

        $item->update($datos);

        return back();
    }

    public function toggle(Producto $producto, VariableGrupo $grupo, VariableItem $item)
    {
        abort_unless($grupo->producto_id === $producto->id, 403);
        abort_unless($item->grupo_id === $grupo->id, 403);

        $item->update(['activo' => ! $item->activo]);

        return back();
    }

    public function destroy(Producto $producto, VariableGrupo $grupo, VariableItem $item, EliminarVariableItem $action)
    {
        abort_unless($grupo->producto_id === $producto->id, 403);
        abort_unless($item->grupo_id === $grupo->id, 403);

        $action->execute($item);

        return back();
    }
}
