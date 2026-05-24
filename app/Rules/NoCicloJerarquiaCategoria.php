<?php

namespace App\Rules;

use App\Models\Category;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Valida que `parent_id` no genere un ciclo en la jerarquía de categorías.
 *
 * Escenarios cubiertos:
 *  - Auto-padre: parent_id == categoría actual.
 *  - Ciclo transitivo: A → B → C, intentar A.parent_id = C crearía A → C → B → A.
 *
 * El frontend evita el caso obvio (no muestra la categoría como opción de su
 * propio padre), pero un curl directo sí lo permitiría — sin esta rule la BD
 * queda en un estado donde `Category::with('parent.parent...')` revienta por
 * recursión infinita.
 *
 * Uso: ['parent_id' => ['nullable', 'exists:categories,id', new NoCicloJerarquiaCategoria($categoryId)]]
 */
class NoCicloJerarquiaCategoria implements ValidationRule
{
    public function __construct(private readonly ?int $categoryId) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Sin categoría actual (create) o sin parent (raíz) → no hay ciclo posible.
        if ($this->categoryId === null || $value === null) {
            return;
        }

        $parentId = (int) $value;

        // Auto-padre directo
        if ($parentId === $this->categoryId) {
            $fail('Una categoría no puede ser su propio padre.');
            return;
        }

        // Recorre la cadena de ancestros hacia arriba. Si encontramos el
        // categoryId, existe un ciclo (el "padre" propuesto es en realidad un
        // descendiente de la categoría que estamos editando).
        $visitados  = [];
        $actualId   = $parentId;

        while ($actualId !== null) {
            // Cortocircuito: si ya pasamos por aquí, la BD ya tenía un ciclo —
            // raro pero protege contra loops infinitos en data corrupta.
            if (in_array($actualId, $visitados, strict: true)) {
                $fail('La jerarquía de categorías tiene un ciclo previo. Contacta al soporte.');
                return;
            }
            $visitados[] = $actualId;

            if ($actualId === $this->categoryId) {
                $fail('No se puede asignar como padre una subcategoría propia.');
                return;
            }

            $padre   = Category::where('id', $actualId)->value('parent_id');
            $actualId = $padre !== null ? (int) $padre : null;
        }
    }
}
