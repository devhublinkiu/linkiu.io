<?php

namespace App\Http\Requests\Productos;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductoInfoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productoId = $this->route('producto')?->id;

        return [
            'nombre'      => ['required', 'string', 'max:200'],
            'slug'        => ['required', 'string', 'max:220', "unique:productos,slug,{$productoId}", 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'category_id' => ['required', 'exists:categories,id'],
            'sku'         => ['nullable', 'string', 'max:100', "unique:productos,sku,{$productoId}"],
            'status'      => ['required', 'in:borrador,activo'],
        ];
    }
}
