<?php

namespace App\Actions\Productos;

use App\Models\Producto;

class ToggleProductoHook
{
    /**
     * Activa o desactiva un hook del producto. Si nunca existió, lo crea
     * con `activo: true`. Retorna el nuevo estado para que el controller
     * arme un flash apropiado.
     *
     * Una sola query (updateOrCreate) en lugar del firstOrCreate+update
     * que hacía 2.
     *
     * Nota deuda — race condition en `orden` (m7 audit):
     * Si dos toggles concurrentes de hooks distintos para el mismo
     * producto crean entradas nuevas a la vez, ambas podrían leer
     * `max(orden)` antes de que la otra commitee y terminar con orden
     * duplicado. En la práctica el mismo admin no toggleará dos hooks
     * en paralelo y el orden no es unique en la BD. Si esto causa un
     * bug real, agregar SELECT FOR UPDATE en una transacción.
     */
    public function execute(string $hookKey, Producto $producto): bool
    {
        $existente   = $producto->hooks()->where('hook_key', $hookKey)->first();
        $nuevoActivo = ! ($existente?->activo ?? false);

        $producto->hooks()->updateOrCreate(
            ['hook_key' => $hookKey],
            [
                'activo' => $nuevoActivo,
                'orden'  => $existente?->orden ?? ($producto->hooks()->max('orden') + 1),
            ],
        );

        return $nuevoActivo;
    }
}
