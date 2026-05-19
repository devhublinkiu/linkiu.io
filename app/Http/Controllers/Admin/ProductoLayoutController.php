<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoLayoutController extends Controller
{
    public function store(Request $request, Producto $producto)
    {
        $data = $request->validate([
            'orden'   => ['required', 'array'],
            'orden.*' => ['required', 'string'],
        ]);

        $producto->update(['layout_orden' => $data['orden']]);

        return back()->with('status', 'Layout guardado.');
    }
}
