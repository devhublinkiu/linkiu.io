<?php

namespace App\Http\Requests\Usuarios;

use App\Rules\TelefonoMovilCO;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdminUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'max:150', 'unique:users,email'],
            'phone'      => ['required', 'string', 'max:20', new TelefonoMovilCO],
            'gender'     => ['nullable', 'in:masculino,femenino,prefiero_no_decir'],
            'username'   => ['required', 'string', 'max:30', 'unique:users,username', 'regex:/^[a-zA-Z0-9_\.]+$/'],
            // role_id NO puede ser super-admin (escalación de privilegios).
            // El frontend ya filtra el dropdown, pero el backend NUNCA debe
            // confiar en el frontend — atacante puede mandar role_id de
            // super-admin directo vía curl/devtools.
            'role_id'    => [
                'required',
                'integer',
                Rule::exists('roles', 'id')->where(
                    fn ($q) => $q->whereNotIn('name', ['super-admin']),
                ),
            ],
            'birthdate'  => ['nullable', 'date', 'before:today'],
            'country'    => ['nullable', 'string', 'max:100'],
            'department' => ['nullable', 'string', 'max:100'],
            'city'       => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.regex' => 'El usuario solo puede contener letras, números, puntos y guiones bajos.',
            'role_id.exists' => 'El rol seleccionado no es válido o no se puede asignar.',
        ];
    }
}
