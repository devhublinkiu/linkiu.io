<?php

namespace App\Actions\Productos;

use App\Models\Producto;
use App\Models\ProductoHook;

class ToggleProductoHook
{
    public function execute(string $hookKey, Producto $producto): ProductoHook
    {
        $hook = $producto->hooks()->firstOrCreate(
            ['hook_key' => $hookKey],
            ['activo' => false, 'orden' => $producto->hooks()->max('orden') + 1],
        );

        $hook->update(['activo' => ! $hook->activo]);

        return $hook;
    }
}
