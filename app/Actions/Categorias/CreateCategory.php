<?php

namespace App\Actions\Categorias;

use App\Models\Category;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CreateCategory
{
    public function execute(array $datos): Category
    {
        $imagen = null;

        if (isset($datos['image']) && $datos['image'] instanceof UploadedFile) {
            $imagen = $datos['image']->store('categorias', 's3');
        }

        return Category::create([
            'name'        => $datos['name'],
            'slug'        => $datos['slug'],
            'parent_id'   => $datos['parent_id'] ?? null,
            'status'      => $datos['status'],
            'image'       => $imagen,
            'description' => $datos['description'] ?? null,
        ]);
    }
}
