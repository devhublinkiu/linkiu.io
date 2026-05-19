<?php

namespace App\Http\Requests\Categorias;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('category')?->id;

        return [
            'name'        => ['required', 'string', 'max:100'],
            'slug'        => ['required', 'string', 'max:120', "unique:categories,slug,{$categoryId}", 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'parent_id'   => ['nullable', 'exists:categories,id'],
            'status'      => ['required', 'in:activo,inactivo'],
            'image'       => ['nullable', 'image', 'max:2048'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
