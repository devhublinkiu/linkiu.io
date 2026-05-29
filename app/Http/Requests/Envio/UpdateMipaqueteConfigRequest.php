<?php

namespace App\Http\Requests\Envio;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMipaqueteConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('envio.editar') ?? false;
    }

    public function rules(): array
    {
        $presetsValidos = array_keys(config('services.mipaquete.presets', []));

        return [
            // Sentinel '***' = no cambiar (cuando el admin no tocó el campo).
            'mipaquete_api_key' => ['nullable', 'string', 'max:1000'],

            // Bodega de origen — código DANE de 8 dígitos.
            'bodega_dane_code'  => ['nullable', 'string', 'regex:/^\d{5,8}$/'],

            // Preset del paquete promedio.
            'paquete_preset'    => ['nullable', 'string', Rule::in($presetsValidos)],
        ];
    }
}
