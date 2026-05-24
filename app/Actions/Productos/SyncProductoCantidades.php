<?php

namespace App\Actions\Productos;

use App\Models\Producto;
use Illuminate\Support\Facades\DB;

class SyncProductoCantidades
{
    public function execute(array $cantidades, Producto $producto): void
    {
        DB::transaction(function () use ($cantidades, $producto) {
            $producto->cantidades()->delete();

            foreach ($cantidades as $index => $item) {
                $producto->cantidades()->create([
                    'imagen'        => $item['imagen'] ?? null,
                    'cantidad'      => $item['cantidad'],
                    'precio_bundle' => $item['precio_bundle'],
                    'badge_texto'   => $item['badge_texto'] ?? null,
                    'destacado'     => (bool) ($item['destacado'] ?? false),
                    'orden'         => $item['orden'] ?? $index,
                ]);
            }
        });
    }
}
