<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Productos\SaveProductoHookConfig;
use App\Actions\Productos\ToggleProductoHook;
use App\Enums\LinkiuHook;
use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoHooksController extends Controller
{
    public function toggle(Producto $producto, string $hook, ToggleProductoHook $action)
    {
        abort_unless(LinkiuHook::tryFrom($hook) !== null, 404);

        $activo = $action->execute($hook, $producto);

        return back()->with('status', $activo ? 'Hook activado.' : 'Hook desactivado.');
    }

    public function saveConfig(Request $request, Producto $producto, string $hook, SaveProductoHookConfig $action)
    {
        abort_unless(LinkiuHook::tryFrom($hook) !== null, 404);

        $action->execute($hook, $request->input('config', []), $producto);

        return back()->with('status', 'Hook configurado correctamente.');
    }
}
