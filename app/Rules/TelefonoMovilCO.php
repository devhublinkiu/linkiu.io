<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Valida que el valor sea un número móvil colombiano.
 *
 * Acepta variaciones comunes (con/sin '+', con/sin código país 57, con
 * espacios o guiones) pero al normalizar (solo dígitos, sin '57' inicial)
 * debe quedar en 10 dígitos empezando por 3.
 *
 * Aplica el mismo criterio que `WhatsappService::normalizarTelefono` para
 * que un teléfono válido aquí también lo sea al enviar OTP por WhatsApp.
 */
class TelefonoMovilCO implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $normalizado = preg_replace('/[^0-9]/', '', (string) $value);

        // Si trae código país 57 + 10 dígitos = 12 caracteres, lo quitamos
        if (strlen($normalizado) === 12 && str_starts_with($normalizado, '57')) {
            $normalizado = substr($normalizado, 2);
        }

        if (! preg_match('/^3\d{9}$/', $normalizado)) {
            $fail('El teléfono debe ser un número móvil colombiano válido (10 dígitos comenzando por 3).');
        }
    }
}
