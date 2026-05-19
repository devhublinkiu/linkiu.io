<?php

namespace App\Http\Requests\Productos;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductoImagenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'imagen' => ['required', 'file', 'mimes:jpeg,jpg,png,webp,gif,bmp', 'max:10240'],
        ];
    }

    public function attributes(): array
    {
        return [
            'imagen' => 'imagen',
        ];
    }
}
