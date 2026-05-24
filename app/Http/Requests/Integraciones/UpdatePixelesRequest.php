<?php

namespace App\Http\Requests\Integraciones;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePixelesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('integraciones.editar') ?? false;
    }

    public function rules(): array
    {
        return [
            // Solo dígitos (6-20). Bloquea inyección de código en el script Meta.
            'fb_pixel_id'               => ['nullable', 'string', 'regex:/^\d{6,20}$/'],
            // Alfanumérico + guiones/underscore. Bloquea comillas y paréntesis.
            'fb_test_event_code'        => ['nullable', 'string', 'max:50', 'regex:/^[A-Z0-9_-]+$/i'],
            // Formato oficial Google Ads: AW-XXXXXXXXX.
            'google_ads_id'             => ['nullable', 'string', 'regex:/^AW-\d{6,12}$/i'],
            // Conversion label de Google Ads: alfanumérico + guiones, ~11 chars típico.
            'google_ads_purchase_label' => ['nullable', 'string', 'max:50', 'regex:/^[A-Za-z0-9_-]+$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'fb_pixel_id.regex'               => 'El Pixel ID debe contener solo números (entre 6 y 20 dígitos).',
            'fb_test_event_code.regex'        => 'El código de prueba solo puede contener letras, números, guiones y guiones bajos.',
            'google_ads_id.regex'             => 'El ID de Google Ads debe tener el formato AW-XXXXXXXXX.',
            'google_ads_purchase_label.regex' => 'El conversion label solo puede contener letras, números, guiones y guiones bajos.',
        ];
    }
}
