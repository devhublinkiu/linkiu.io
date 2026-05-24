<?php

namespace App\Http\Controllers\Admin;

use App\Enums\LinkiuHook;
use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductoLayoutController extends Controller
{
    public function store(Request $request, Producto $producto)
    {
        // 'info' es un bloque especial del layout (no es hook) que representa
        // la sección "Información del producto" — siempre presente al inicio.
        // El frontend lo incluye en el orden, así que el backend debe aceptarlo.
        $keysValidas = [...array_map(fn ($h) => $h->value, LinkiuHook::cases()), 'info'];

        $data = $request->validate([
            'orden'   => ['required', 'array'],
            'orden.*' => ['required', 'string', Rule::in($keysValidas)],
        ]);

        $producto->update(['layout_orden' => $data['orden']]);

        return back()->with('status', 'Layout guardado.');
    }
}
