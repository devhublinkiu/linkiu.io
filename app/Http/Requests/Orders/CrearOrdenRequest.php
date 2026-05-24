<?php

namespace App\Http\Requests\Orders;

use App\Rules\TelefonoMovilCO;
use Illuminate\Foundation\Http\FormRequest;

class CrearOrdenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre'              => ['required', 'string', 'max:100'],
            'apellido'            => ['required', 'string', 'max:100'],
            'email'               => ['required', 'email', 'max:200'],
            'telefono'            => ['required', 'string', 'max:30', new TelefonoMovilCO],
            'departamento'        => ['required', 'string', 'max:100'],
            'ciudad'              => ['required', 'string', 'max:100'],
            'direccion'           => ['required', 'string', 'max:300'],
            'apartamento'         => ['nullable', 'string', 'max:100'],
            'notas'               => ['nullable', 'string', 'max:500'],
            'metodo_pago'         => ['required', 'string', 'max:50'],
            'subtotal'            => ['required', 'integer', 'min:0'],
            // costo_envio y total NO se validan aquí — CrearOrden los recalcula
            // con EnvioService a partir de ciudad + subtotal + recargo. Lo que
            // mande el cliente se ignora (prevención de tampering).
            'recargo'             => ['required', 'integer', 'min:0'],
            'crear_cuenta'        => ['boolean'],
            'contrasena'          => ['nullable', 'string', 'min:8', 'required_if:crear_cuenta,true'],
            'comprobante'         => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'items'               => ['required', 'array', 'min:1'],
            'items.*.producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'items.*.nombre'      => ['required', 'string', 'max:200'],
            'items.*.imagen'      => ['nullable', 'string', 'max:500'],
            'items.*.label'       => ['nullable', 'string', 'max:100'],
            'items.*.cantidad'    => ['required', 'integer', 'min:1'],
            'items.*.precio'      => ['required', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'       => 'Tu nombre es obligatorio.',
            'apellido.required'     => 'Tu apellido es obligatorio.',
            'email.required'        => 'Tu correo es obligatorio.',
            'email.email'           => 'El formato del correo no es válido.',
            'telefono.required'     => 'Tu teléfono es obligatorio.',
            'departamento.required' => 'Selecciona un departamento.',
            'ciudad.required'       => 'Selecciona una ciudad.',
            'direccion.required'    => 'La dirección es obligatoria.',
            'metodo_pago.required'  => 'Selecciona un método de pago.',
            'contrasena.min'        => 'La contraseña debe tener al menos 8 caracteres.',
            'comprobante.mimes'     => 'El comprobante debe ser una imagen (JPG, PNG) o PDF.',
            'comprobante.max'       => 'El comprobante no puede pesar más de 5 MB.',
            'items.required'        => 'Tu pedido no tiene productos.',
            'items.min'             => 'Tu pedido no tiene productos.',
        ];
    }
}
