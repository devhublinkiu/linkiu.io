<?php

namespace App\Http\Requests\Categorias;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Defensa profunda — el controller también tiene abort_if. Si alguien
        // refactoriza y quita el abort_if, esta capa sigue protegiendo.
        return $this->user()?->can('categorias.crear') ?? false;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:100'],
            'slug'        => ['required', 'string', 'max:120', 'unique:categories,slug', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'parent_id'   => ['nullable', 'exists:categories,id'],
            'status'      => ['required', 'in:activo,inactivo'],
            'image'       => ['nullable', 'image', 'max:2048'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'El nombre de la categoría es obligatorio.',
            'name.max'             => 'El nombre no puede superar los 100 caracteres.',
            'slug.required'        => 'El slug es obligatorio.',
            'slug.unique'          => 'Ya existe una categoría con ese slug.',
            'slug.regex'           => 'El slug solo puede contener letras minúsculas, números y guiones (ej: ropa-deportiva).',
            'slug.max'             => 'El slug no puede superar los 120 caracteres.',
            'parent_id.exists'     => 'La categoría padre seleccionada no existe.',
            'status.required'      => 'Indica si la categoría está activa o inactiva.',
            'status.in'            => 'Estado inválido.',
            'image.image'          => 'El archivo debe ser una imagen (JPG, PNG, WebP).',
            'image.max'            => 'La imagen no puede pesar más de 2 MB.',
            'description.max'      => 'La descripción no puede superar los 500 caracteres.',
        ];
    }
}
