<?php

namespace App\Actions\Productos;

use App\Models\Producto;
use App\Models\ProductoHook;

class SaveProductoHookConfig
{
    public function execute(string $hookKey, array $config, Producto $producto): ProductoHook
    {
        $hook = $producto->hooks()->firstOrCreate(
            ['hook_key' => $hookKey],
            ['activo' => true, 'orden' => $producto->hooks()->max('orden') + 1],
        );

        $hook->update(['config' => $config, 'activo' => true]);

        return $hook;
    }
}
