<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Productos\SubirProductoHookImagen;
use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductoHookImagenesController extends Controller
{
    private const HOOKS_CON_IMAGENES = [
        'slider_imagenes', 'comparacion_visual', 'galeria_resultados', 'resenas_clientes',
        'imagen_promesa', 'imagen_intermedia', 'imagen_cierre', 'resenas_imagen',
    ];

    public function store(Request $request, Producto $producto, string $hook, SubirProductoHookImagen $action)
    {
        abort_unless(in_array($hook, self::HOOKS_CON_IMAGENES), 404);

        $request->validate(['imagen' => 'required|image|max:10240']);

        $result = $action->execute($request->file('imagen'), $producto, $hook);

        return response()->json($result);
    }

    public function destroy(Request $request, Producto $producto, string $hook)
    {
        abort_unless(in_array($hook, self::HOOKS_CON_IMAGENES), 404);

        $request->validate([
            'ruta' => ['required', 'string', 'regex:/^productos\/\d+\/hooks\/[a-z_]+\/[a-f0-9\-]+\.webp$/i'],
        ]);

        $ruta = $request->string('ruta');

        // Defense in depth: la ruta debe pertenecer a este producto + hook específico.
        abort_unless(
            str_starts_with($ruta, "productos/{$producto->id}/hooks/{$hook}/"),
            403,
        );

        Storage::disk('s3')->delete($ruta);

        return response()->json(['ok' => true]);
    }
}
