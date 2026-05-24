<?php

namespace App\Http\Requests\Productos;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductoPrecioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'precio_base'                => ['required', 'numeric', 'min:0'],
            'precio_comparacion'         => ['nullable', 'numeric', 'min:0'],
            'aplica_iva'                 => ['boolean'],
            'iva_porcentaje'             => ['nullable', 'in:0,5,19'],
            'cantidades'                 => ['array'],
            'cantidades.*.cantidad'      => ['required', 'integer', 'min:1'],
            'cantidades.*.precio_bundle' => ['required', 'numeric', 'min:0'],
            'cantidades.*.badge_texto'   => ['nullable', 'string', 'max:50'],
            'cantidades.*.destacado'     => ['boolean'],
            'cantidades.*.imagen'        => ['nullable', 'string'],
            'cantidades.*.orden'         => ['nullable', 'integer'],
        ];
    }

    public function attributes(): array
    {
        return [
            'precio_base'                => 'precio base',
            'cantidades.*.cantidad'      => 'cantidad',
            'cantidades.*.precio_bundle' => 'precio del bundle',
        ];
    }
}
