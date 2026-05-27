<?php

namespace App\Http\Requests\Bold;

use Illuminate\Foundation\Http\FormRequest;

class IniciarPagoBoldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order'                     => 'required|array',
            'order.nombre'              => 'required|string|max:100',
            'order.apellido'            => 'required|string|max:100',
            'order.email'               => 'required|email|max:200',
            'order.telefono'            => 'required|string|max:30',
            'order.departamento'        => 'required|string|max:100',
            'order.ciudad'              => 'required|string|max:100',
            'order.direccion'           => 'required|string|max:200',
            'order.apartamento'         => 'nullable|string|max:100',
            'order.notas'               => 'nullable|string|max:500',
            'order.subtotal'            => 'required|integer|min:0',
            'order.costo_envio'         => 'required|integer|min:0',
            'order.recargo'             => 'required|integer|min:0',
            'order.total'               => 'required|integer|min:1000',
            'order.items'               => 'required|array|min:1',
            'order.items.*.nombre'      => 'required|string',
            'order.items.*.imagen'      => 'nullable|string',
            'order.items.*.label'       => 'nullable|string',
            'order.items.*.cantidad'    => 'required|integer|min:1',
            'order.items.*.precio'      => 'required|integer|min:0',
            'order.items.*.producto_id' => 'nullable|integer|exists:productos,id',
        ];
    }
}
