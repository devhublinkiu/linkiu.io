<?php

namespace App\Http\Resources\Productos;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Shape público de un producto para cards/listados.
 *
 * Requiere eager loading de: imagenPrincipal, categoria, hooks (filtrados a
 * oferta_relampago y badge_producto activos), y withCount(['variableGrupos',
 * 'cantidades']) para resolver requiere_seleccion.
 *
 * Para uso con un slug de categoría distinto al del producto (página de
 * categoría) pasar el slug via `additional(['categoria_slug_override' => $slug])`
 * o crear instancias con `new ProductoPublicoResource($producto, $slugOverride)`
 * via el wrapper estático.
 */
class ProductoPublicoResource extends JsonResource
{
    public function __construct($resource, private ?string $categoriaSlugOverride = null)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        $variableGruposCount = (int) ($this->variable_grupos_count ?? 0);
        $cantidadesCount     = (int) ($this->cantidades_count ?? 0);

        return [
            'id'                 => $this->id,
            'nombre'             => $this->nombre,
            'slug'               => $this->slug,
            'precio_base'        => (float) $this->precio_base,
            'precio_comparacion' => $this->precio_comparacion ? (float) $this->precio_comparacion : null,
            'imagen_principal'   => $this->imagenPrincipal?->url,
            'categoria_slug'     => $this->categoriaSlugOverride ?? $this->categoria?->slug,
            'oferta_relampago'   => $this->hooks->contains('hook_key', 'oferta_relampago'),
            'badge'              => $this->hooks->firstWhere('hook_key', 'badge_producto')?->config['texto'] ?? null,
            // Decide si el botón "Comprar ahora" lleva a detalle (variantes/cantidades) o a checkout directo.
            'requiere_seleccion' => $variableGruposCount > 0 || $cantidadesCount > 1,
        ];
    }
}
