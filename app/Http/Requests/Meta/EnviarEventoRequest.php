<?php

namespace App\Http\Requests\Meta;

use App\Enums\MetaEvent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EnviarEventoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_name'             => ['required', 'string', Rule::in(MetaEvent::values())],
            'event_id'               => ['required', 'string', 'regex:/^[a-f0-9\-]{8,64}$/i'],
            'event_source_url'       => ['required', 'string', 'url', 'max:500'],

            // Datos custom del evento — todos opcionales.
            'custom_data'            => ['nullable', 'array'],
            'custom_data.value'      => ['nullable', 'numeric', 'min:0'],
            'custom_data.currency'   => ['nullable', 'string', 'max:3'],
            'custom_data.content_ids'   => ['nullable', 'array'],
            'custom_data.content_ids.*' => ['nullable', 'string', 'max:50'],
            'custom_data.content_name'  => ['nullable', 'string', 'max:200'],
            'custom_data.content_type'  => ['nullable', 'string', 'max:50'],
            'custom_data.num_items'     => ['nullable', 'integer', 'min:0'],
            'custom_data.order_id'      => ['nullable', 'string', 'max:50'],

            // PII opcional — la mandamos al endpoint en TEXTO PLANO; el server
            // se encarga de hashear server-side. Esto es importante: el browser
            // nunca toca el hash final.
            'user_data'              => ['nullable', 'array'],
            'user_data.email'        => ['nullable', 'string', 'email', 'max:200'],
            'user_data.phone'        => ['nullable', 'string', 'max:30'],
            'user_data.first_name'   => ['nullable', 'string', 'max:80'],
            'user_data.last_name'    => ['nullable', 'string', 'max:80'],
            'user_data.external_id'  => ['nullable', 'string', 'max:100'],

            // Solo presente cuando es "Probar conexión".
            'test_event_code'        => ['nullable', 'string', 'max:50', 'regex:/^[A-Z0-9_-]+$/i'],
        ];
    }
}
