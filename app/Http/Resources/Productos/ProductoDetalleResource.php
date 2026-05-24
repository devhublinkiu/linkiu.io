<?php

namespace App\Http\Resources\Productos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shape público completo de un producto para la página de detalle.
 *
 * Requiere eager loading de: hooks, cantidades, imagenes, variableGrupos.items.
 * Filtra hooks activos y items activos de variables, ordena por 'orden'.
 */
class ProductoDetalleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $principal = $this->imagenes->firstWhere('principal', true)
                  ?? $this->imagenes->sortBy('orden')->first();

        return [
            'producto_id'      => $this->id,
            'nombre'           => $this->nombre,
            'slug'             => $this->slug,
            'sku'              => $this->sku,
            'descripcion'      => $this->descripcion,
            'unidad'           => $this->unidad ?? 'Unidad',
            'precio_base'      => $this->precio_base,
            'imagen_principal' => $principal?->url,
            'layout_orden'     => $this->layout_orden ?? null,

            'hooks' => $this->hooks
                ->where('activo', true)
                ->map(fn ($h) => [
                    'key'    => $h->hook_key,
                    'config' => $h->config ?? [],
                ])
                ->values()
                ->toArray(),

            'imagenes' => $this->imagenes
                ->sortBy('orden')
                ->map(fn ($i) => [
                    'url'       => $i->url,
                    'principal' => (bool) $i->principal,
                ])
                ->values()
                ->toArray(),

            'grupos' => $this->variableGrupos
                ->sortBy('orden')
                ->map(fn ($g) => [
                    'id'     => $g->id,
                    'nombre' => $g->nombre,
                    'tipo'   => $g->tipo,
                    'items'  => $g->items
                        ->where('activo', true)
                        ->sortBy('orden')
                        ->map(fn ($i) => [
                            'id'            => $i->id,
                            'nombre'        => $i->nombre,
                            'valor'         => $i->valor,
                            'url'           => $i->url,
                            'precio_ajuste' => $i->precio_ajuste,
                        ])
                        ->values()
                        ->toArray(),
                ])
                ->values()
                ->toArray(),

            'cantidades' => $this->cantidades
                ->sortBy('orden')
                ->map(fn ($c) => [
                    'cantidad'      => $c->cantidad,
                    'precio_bundle' => $c->precio_bundle,
                    'badge_texto'   => $c->badge_texto,
                    'destacado'     => $c->destacado,
                    'imagen'        => $c->imagen,
                ])
                ->values()
                ->toArray(),
        ];
    }
}
