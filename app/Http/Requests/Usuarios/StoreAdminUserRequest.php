<?php

namespace App\Http\Requests\Usuarios;

use Illuminate\Foundation\Http\FormRequest;

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
            'phone'      => ['required', 'string', 'max:20'],
            'gender'     => ['nullable', 'in:masculino,femenino,prefiero_no_decir'],
            'username'   => ['required', 'string', 'max:30', 'unique:users,username', 'regex:/^[a-zA-Z0-9_\.]+$/'],
            'role_id'    => ['required', 'integer', 'exists:roles,id'],
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
        ];
    }
}
