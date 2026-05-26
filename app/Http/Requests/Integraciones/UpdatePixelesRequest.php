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
            // System User Access Token de Meta — string opaco largo. Validación
            // permisiva (puede contener cualquier char no-whitespace). Si llega
            // el sentinel "***" significa "no cambiar el actual" (UI lo manda así
            // cuando hay token guardado y el usuario no tocó el campo).
            'fb_access_token'           => ['nullable', 'string', 'max:500', 'regex:/^[\S]+$/'],
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
            'fb_access_token.regex'           => 'El Access Token no debe contener espacios.',
            'google_ads_id.regex'             => 'El ID de Google Ads debe tener el formato AW-XXXXXXXXX.',
            'google_ads_purchase_label.regex' => 'El conversion label solo puede contener letras, números, guiones y guiones bajos.',
        ];
    }
}
