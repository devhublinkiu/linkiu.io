<?php

namespace App\Http\Requests\MetodosPago;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * Reglas de validación del descuento por método de pago.
 *
 * El descuento es independiente del resto del config (recargo/transferencia)
 * y se actualiza vía endpoint dedicado con merge — por eso no vive en
 * UpdateMetodoPagoConfigRequest.
 *
 * Tope máximo:
 *  - porcentaje: 50% (configuración razonable; >50% suele ser error de tecla).
 *  - fijo:       9.999.999 COP (límite arbitrario alto para mantener cordura
 *                en órdenes — descuentos mayores rompen UX al opacar el total).
 *
 * Para limpiar el descuento, enviar `tipo: null`. El valor se ignora cuando
 * tipo es null.
 */
class UpdateMetodoPagoDescuentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('metodos-pago.editar') ?? false;
    }

    public function rules(): array
    {
        return [
            'tipo'  => ['nullable', 'in:fijo,porcentaje'],
            'valor' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $data = $v->getData();
            $tipo  = $data['tipo']  ?? null;
            $valor = $data['valor'] ?? null;

            if ($tipo === null) {
                return;
            }

            if ($valor === null || $valor === '') {
                $v->errors()->add('valor', 'Debes indicar un valor cuando hay tipo de descuento.');
                return;
            }

            if ($tipo === 'porcentaje' && $valor > 50) {
                $v->errors()->add('valor', 'El descuento porcentaje no puede superar 50%.');
            }

            if ($tipo === 'fijo' && $valor > 9999999) {
                $v->errors()->add('valor', 'El descuento fijo no puede superar $9.999.999.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'tipo.in'         => 'El tipo de descuento debe ser fijo o porcentaje.',
            'valor.numeric'   => 'El valor del descuento debe ser numérico.',
            'valor.min'       => 'El valor del descuento no puede ser negativo.',
        ];
    }
}
