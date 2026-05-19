<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Productos\EliminarProductoImagen;
use App\Actions\Productos\MarcarImagenPrincipal;
use App\Actions\Productos\SubirProductoImagen;
use App\Http\Controllers\Controller;
use App\Http\Requests\Productos\StoreProductoImagenRequest;
use App\Models\Producto;
use App\Models\ProductoImagen;

class ProductoImagenesController extends Controller
{
    public function store(StoreProductoImagenRequest $request, Producto $producto, SubirProductoImagen $action)
    {
        $action->execute($request->file('imagen'), $producto);

        return back()->with('status', 'Imagen subida correctamente.');
    }

    public function destroy(Producto $producto, ProductoImagen $imagen, EliminarProductoImagen $action)
    {
        abort_unless($imagen->producto_id === $producto->id, 404);

        $action->execute($imagen);

        return back()->with('status', 'Imagen eliminada.');
    }

    public function setPrincipal(Producto $producto, ProductoImagen $imagen, MarcarImagenPrincipal $action)
    {
        abort_unless($imagen->producto_id === $producto->id, 404);

        $action->execute($imagen);

        return back()->with('status', 'Imagen principal actualizada.');
    }
}
