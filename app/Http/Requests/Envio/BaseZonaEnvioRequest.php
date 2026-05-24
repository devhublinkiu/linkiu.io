<?php

namespace App\Http\Requests\Envio;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Reglas y mensajes comunes a StoreZonaEnvioRequest y UpdateZonaEnvioRequest.
 *
 * Store y Update reciben el mismo payload (la zona se reemplaza completa al
 * editar — frontend manda todos los campos). Esta base evita duplicar las
 * ~15 reglas y mantiene los mensajes ES sincronizados entre ambas.
 */
abstract class BaseZonaEnvioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('envio.editar') ?? false;
    }

    public function rules(): array
    {
        return [
            'nombre'                              => ['required', 'string', 'max:100'],
            'departamentos'                       => ['required', 'array', 'min:1'],
            'departamentos.*.id'                  => ['required', 'integer'],
            'departamentos.*.nombre'              => ['required', 'string', 'max:100'],
            'departamentos.*.ciudades'            => ['required', 'array', 'min:1'],
            'departamentos.*.ciudades.*.id'       => ['required', 'integer'],
            'departamentos.*.ciudades.*.nombre'   => ['required', 'string', 'max:100'],

            // Coherencia tipo_costo ↔ costo ↔ umbral_gratis:
            //  - 'gratis'       → costo y umbral irrelevantes (Action los anula).
            //  - 'costo_fijo'   → costo requerido.
            //  - 'gratis_desde' → costo y umbral requeridos (umbral > 0).
            'tipo_costo'                          => ['required', 'in:gratis,costo_fijo,gratis_desde'],
            'costo'                               => ['nullable', 'integer', 'min:0', 'required_if:tipo_costo,costo_fijo,gratis_desde'],
            'umbral_gratis'                       => ['nullable', 'integer', 'min:1', 'required_if:tipo_costo,gratis_desde'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'                         => 'El nombre de la zona es obligatorio.',
            'nombre.max'                              => 'El nombre no puede superar los 100 caracteres.',
            'departamentos.required'                  => 'Selecciona al menos un departamento.',
            'departamentos.min'                       => 'Selecciona al menos un departamento.',
            'departamentos.*.ciudades.required'       => 'Cada departamento debe tener al menos una ciudad.',
            'departamentos.*.ciudades.min'            => 'Cada departamento debe tener al menos una ciudad.',
            'tipo_costo.required'                     => 'Selecciona el tipo de costo de envío.',
            'tipo_costo.in'                           => 'Tipo de costo inválido. Usa Gratis, Costo fijo o Gratis desde.',
            'costo.required_if'                       => 'Indica el costo del envío.',
            'costo.integer'                           => 'El costo debe ser un número entero.',
            'costo.min'                               => 'El costo no puede ser negativo.',
            'umbral_gratis.required_if'               => 'Indica el monto a partir del cual el envío es gratis.',
            'umbral_gratis.integer'                   => 'El umbral debe ser un número entero.',
            'umbral_gratis.min'                       => 'El umbral debe ser mayor a 0.',
        ];
    }
}
