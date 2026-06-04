<?php

namespace App\Http\Requests\Reset;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ResetFunelinksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('superadmin.reset') ?? false;
    }

    public function rules(): array
    {
        return [
            'desde'             => ['required', 'date'],
            'hasta'             => ['required', 'date', 'after_or_equal:desde'],
            'producto_id'       => ['nullable', 'integer', 'exists:productos,id'],
            'borrar_sesiones'   => ['nullable', 'boolean'],
            'borrar_visitas'    => ['nullable', 'boolean'],
            'borrar_fomo'       => ['nullable', 'boolean'],
            'motivo'            => ['required', 'string', 'min:10', 'max:200'],
            'confirmacion'      => ['required', 'string'],
        ];
    }

    /**
     * Validamos que al menos uno de los flags esté en true Y que la frase
     * tipeada coincida exactamente con "BORRAR YYYY-MM-DD a YYYY-MM-DD".
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $data = $v->getData();

            $algunoBorrado = ($data['borrar_sesiones'] ?? false)
                || ($data['borrar_visitas']  ?? false)
                || ($data['borrar_fomo']     ?? false);

            if (! $algunoBorrado) {
                $v->errors()->add('borrar_sesiones', 'Marca al menos una categoría de datos para borrar.');
                return;
            }

            $esperada = "BORRAR {$data['desde']} a {$data['hasta']}";
            if (($data['confirmacion'] ?? null) !== $esperada) {
                $v->errors()->add(
                    'confirmacion',
                    "Tipea exactamente: {$esperada}",
                );
            }
        });
    }
}
