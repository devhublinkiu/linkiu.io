<?php

namespace App\Http\Requests\Perfil;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * Valida la actualización de datos personales del admin (nombre + password).
 *
 * Centraliza TODA la lógica de seguridad para el cambio de password:
 *  - `password_actual` se valida con la regla nativa `current_password` de
 *    Laravel (chequea contra el guard activo). Reemplaza el Hash::check inline
 *    que vivía en el controller.
 *  - `password_actual` solo es requerido si el usuario está intentando cambiar
 *    la password (required_with:password).
 *  - Política de password: mínimo 8, mixedCase, números y símbolos.
 *
 * Combinado con Auth::logoutOtherDevices() en la Action y throttle:perfil-update
 * en la ruta, cierra el vector de cookie robada → toma de cuenta.
 */
class UpdatePerfilPersonalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('perfil.editar') ?? false;
    }

    public function rules(): array
    {
        return [
            'name'                  => ['required', 'string', 'max:100'],
            'password_actual'       => ['nullable', 'required_with:password', 'current_password'],
            'password'              => ['nullable', 'confirmed', Password::min(8)],
            'password_confirmation' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                  => 'Tu nombre es obligatorio.',
            'name.max'                       => 'El nombre no puede superar los 100 caracteres.',
            'password_actual.required_with'  => 'Indica tu contraseña actual para cambiarla.',
            'password_actual.current_password' => 'La contraseña actual no es correcta.',
            'password.confirmed'             => 'La confirmación de la nueva contraseña no coincide.',
            'password.min'                   => 'La nueva contraseña debe tener al menos 8 caracteres.',
        ];
    }
}
