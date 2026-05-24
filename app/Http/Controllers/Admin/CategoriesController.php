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
use Illuminate\Http\Request;

class CategoriesController extends Controller
{
    public function index()
    {
        abort_if(! auth()->user()->can('categorias.ver'), 403);

        $categorias = Category::with('parent')
            ->withCount(['children', 'productos'])
            ->orderByRaw('CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END')
            ->orderBy('name')
            ->paginate(20)
            ->through(fn (Category $c) => [
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
        abort_if(! auth()->user()->can('categorias.crear'), 403);

        $action->execute($request->validated());

        return back()->with('status', 'Categoría creada correctamente.');
    }

    public function update(UpdateCategoryRequest $request, Category $category, UpdateCategory $action)
    {
        abort_if(! auth()->user()->can('categorias.editar'), 403);

        $action->execute($category, $request->validated());

        return back()->with('status', 'Categoría actualizada correctamente.');
    }

    public function destroy(Category $category, DeleteCategory $action)
    {
        abort_if(! auth()->user()->can('categorias.eliminar'), 403);

        $resultado = $action->execute($category);

        if (isset($resultado['error'])) {
            $mensaje = match ($resultado['error']) {
                'tiene_subcategorias' => 'No se puede eliminar una categoría que tiene subcategorías.',
                'tiene_productos'     => 'No se puede eliminar una categoría que tiene productos asociados.',
                default               => 'No se pudo eliminar la categoría.',
            };

            return back()->withErrors(['general' => $mensaje]);
        }

        return back()->with('status', 'Categoría eliminada correctamente.');
    }
}
