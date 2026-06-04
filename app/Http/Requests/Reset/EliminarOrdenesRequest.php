<?php

namespace App\Http\Requests\Reset;

use Illuminate\Foundation\Http\FormRequest;

class EliminarOrdenesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('superadmin.reset') ?? false;
    }

    public function rules(): array
    {
        return [
            'ids'       => ['required', 'array', 'min:1', 'max:200'],
            'ids.*'     => ['integer', 'exists:orders,id'],
            'motivo'    => ['required', 'string', 'min:10', 'max:200'],
            'confirmar' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required'      => 'Selecciona al menos una orden.',
            'ids.max'           => 'No puedes eliminar más de 200 órdenes a la vez.',
            'motivo.required'   => 'Debes indicar un motivo.',
            'motivo.min'        => 'El motivo debe tener al menos 10 caracteres.',
            'motivo.max'        => 'El motivo no puede superar los 200 caracteres.',
            'confirmar.accepted' => 'Debes confirmar que entiendes que la acción es permanente.',
        ];
    }
}
