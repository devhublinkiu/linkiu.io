<?php

namespace App\Actions\Categorias;

use App\Models\Category;
use Illuminate\Support\Facades\Storage;

class DeleteCategory
{
    public function execute(Category $category): array
    {
        if ($category->children()->exists()) {
            return ['error' => 'tiene_subcategorias'];
        }

        if ($category->productos()->exists()) {
            return ['error' => 'tiene_productos'];
        }

        if ($category->image) {
            Storage::disk('s3')->delete($category->image);
        }

        $category->delete();

        return ['ok' => true];
    }
}
