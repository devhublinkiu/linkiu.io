<?php

namespace App\Actions\Categorias;

use App\Models\Category;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateCategory
{
    public function execute(Category $category, array $datos): Category
    {
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
}
