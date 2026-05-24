<?php

namespace App\Actions\Categorias;

use App\Models\Category;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateCategory
{
    /**
     * @throws \InvalidArgumentException si el parent_id propuesto crearía un
     *   ciclo en la jerarquía (auto-padre o descendiente propio).
     */
    public function execute(Category $category, array $datos): Category
    {
        // Defensa profunda: UpdateCategoryRequest ya valida con
        // NoCicloJerarquiaCategoria, pero esta Action puede ser llamada desde
        // tinker/seeders/jobs sin pasar por el FormRequest.
        $this->guardiaCiclos($category, $datos['parent_id'] ?? null);

        $imagen = $category->image;

        if (isset($datos['image']) && $datos['image'] instanceof UploadedFile) {
            if ($imagen) {
                Storage::disk('s3')->delete($imagen);
            }
            $imagen = $datos['image']->store('categorias', 's3');
        }

        $category->update([
            'name'        => $datos['name'],
            'slug'        => $datos['slug'],
            'parent_id'   => $datos['parent_id'] ?? null,
            'status'      => $datos['status'],
            'image'       => $imagen,
            'description' => $datos['description'] ?? null,
        ]);

        return $category;
    }

    private function guardiaCiclos(Category $category, int|string|null $parentIdPropuesto): void
    {
        if ($parentIdPropuesto === null) {
            return;
        }

        $parentId = (int) $parentIdPropuesto;

        if ($parentId === $category->id) {
            throw new \InvalidArgumentException('Una categoría no puede ser su propio padre.');
        }

        $visitados = [];
        $actualId  = $parentId;

        while ($actualId !== null) {
            if (in_array($actualId, $visitados, strict: true)) {
                throw new \InvalidArgumentException('La jerarquía tiene un ciclo previo. Contacta al soporte.');
            }
            $visitados[] = $actualId;

            if ($actualId === $category->id) {
                throw new \InvalidArgumentException('No se puede asignar como padre una subcategoría propia.');
            }

            $padre    = Category::where('id', $actualId)->value('parent_id');
            $actualId = $padre !== null ? (int) $padre : null;
        }
    }
}
