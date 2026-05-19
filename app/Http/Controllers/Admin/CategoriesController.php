<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Categorias\CreateCategory;
use App\Actions\Categorias\DeleteCategory;
use App\Actions\Categorias\UpdateCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Categorias\StoreCategoryRequest;
use App\Http\Requests\Categorias\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CategoriesController extends Controller
{
    public function index()
    {
        $categorias = Category::with('parent')
            ->withCount(['children', 'productos'])
            ->orderByRaw('CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $c) => [
                'id'             => $c->id,
                'name'           => $c->name,
                'slug'           => $c->slug,
                'parent_id'      => $c->parent_id,
                'parent_name'    => $c->parent?->name,
                'status'         => $c->status,
                'image_url'      => $c->image ? Storage::disk('s3')->url($c->image) : null,
                'description'    => $c->description,
                'children_count' => $c->children_count,
                'products_count' => $c->productos_count,
            ]);

        $padres = Category::whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/categorias/Index', [
            'categorias' => $categorias,
            'padres'     => $padres,
        ]);
    }

    public function store(StoreCategoryRequest $request, CreateCategory $action)
    {
        $action->execute($request->validated());

        return back()->with('status', 'CategorÃ­a creada correctamente.');
    }

    public function update(UpdateCategoryRequest $request, Category $category, UpdateCategory $action)
    {
        $action->execute($category, $request->validated());

        return back()->with('status', 'CategorÃ­a actualizada correctamente.');
    }

    public function destroy(Category $category, DeleteCategory $action)
    {
        $resultado = $action->execute($category);

        if (isset($resultado['error'])) {
            $mensaje = match ($resultado['error']) {
                'tiene_subcategorias' => 'No se puede eliminar una categorÃ­a que tiene subcategorÃ­as.',
                'tiene_productos'     => 'No se puede eliminar una categorÃ­a que tiene productos asociados.',
                default               => 'No se pudo eliminar la categorÃ­a.',
            };

            return back()->withErrors(['general' => $mensaje]);
        }

        return back()->with('status', 'CategorÃ­a eliminada correctamente.');
    }
}
