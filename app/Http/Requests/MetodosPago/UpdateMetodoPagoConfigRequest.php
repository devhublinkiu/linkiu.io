<?php

namespace App\Http\Requests\MetodosPago;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMetodoPagoConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('metodos-pago.editar') ?? false;
    }

    public function rules(): array
    {
        return [
            'config'                       => ['nullable', 'array'],
            'config.recargo'               => ['nullable', 'integer', 'min:0'],
            'config.banco'                 => ['nullable', 'string', 'max:100'],
            'config.tipo_cuenta'           => ['nullable', 'in:ahorros,corriente,bre-b,billetera-virtual'],
            'config.numero_cuenta'         => ['nullable', 'string', 'max:50'],
            'config.titular'               => ['nullable', 'string', 'max:150'],
            'config.tipo_doc'              => ['nullable', 'in:CC,NIT,CE,PA'],
            'config.numero_doc'            => ['nullable', 'string', 'max:20'],
            // El sanitizado HTML lo hace UpdateMetodoPagoConfig::sanitizarInstrucciones.
            // Aquí solo limitamos tamaño bruto antes de sanitizar.
            'config.instrucciones'         => ['nullable', 'string', 'max:500'],
            'config.comprobante_requerido' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'config.recargo.integer'      => 'El recargo debe ser un número entero.',
            'config.recargo.min'          => 'El recargo no puede ser negativo.',
            'config.banco.max'            => 'El nombre del banco no puede superar los 100 caracteres.',
            'config.tipo_cuenta.in'       => 'Tipo de cuenta inválido. Usa Ahorros, Corriente, Bre-B o Billetera virtual.',
            'config.numero_cuenta.max'    => 'El número de cuenta no puede superar los 50 caracteres.',
            'config.titular.max'          => 'El nombre del titular no puede superar los 150 caracteres.',
            'config.tipo_doc.in'          => 'Tipo de documento inválido. Usa CC, NIT, CE o PA.',
            'config.numero_doc.max'       => 'El número de documento no puede superar los 20 caracteres.',
            'config.instrucciones.max'    => 'Las instrucciones no pueden superar los 500 caracteres.',
            'config.comprobante_requerido.boolean' => 'El campo "requerir comprobante" debe ser verdadero o falso.',
        ];
    }
}
