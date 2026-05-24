<?php

namespace App\Http\Requests\Blogs;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Reglas y mensajes comunes a Store/Update. Subclase ajusta el unique en `slug`.
 */
abstract class BaseBlogPostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'titulo'       => ['required', 'string', 'max:200'],
            'slug'         => ['required', 'string', 'max:220', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $this->slugUniqueRule()],
            'resumen'      => ['nullable', 'string', 'max:300'],
            'contenido'    => ['required', 'string'],
            'imagen'       => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'estado'       => ['required', 'in:borrador,publicado'],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required'  => 'El título del post es obligatorio.',
            'titulo.max'       => 'El título no puede superar los 200 caracteres.',
            'slug.required'    => 'El slug es obligatorio.',
            'slug.regex'       => 'El slug solo puede contener letras minúsculas, números y guiones (ej: mi-primer-post).',
            'slug.unique'      => 'Ya existe un post con ese slug.',
            'slug.max'         => 'El slug no puede superar los 220 caracteres.',
            'resumen.max'      => 'El resumen no puede superar los 300 caracteres.',
            'contenido.required' => 'El contenido del post es obligatorio.',
            'imagen.image'     => 'La imagen destacada debe ser un archivo de imagen válido.',
            'imagen.mimes'     => 'La imagen debe ser JPG, PNG o WebP.',
            'imagen.max'       => 'La imagen no puede pesar más de 3 MB.',
            'estado.required'  => 'Indica si el post es borrador o publicado.',
            'estado.in'        => 'Estado inválido. Usa borrador o publicado.',
        ];
    }

    /** Devuelve la regla unique correspondiente (con o sin ignore). */
    abstract protected function slugUniqueRule(): string;
}
