<?php

namespace App\Support\Meta;

/**
 * Helper para normalizar y hashear PII según spec de Meta CAPI.
 *
 * Toda info personal (email, phone, name) debe ir hasheada en SHA-256
 * con normalización previa. Meta hace match contra su base hasheando
 * los datos del usuario del mismo modo.
 *
 * Ref: https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
class MetaHashHelper
{
    /**
     * Email: trim + lowercase + sha256.
     * Retorna null si el input es vacío o inválido.
     */
    public static function email(?string $email): ?string
    {
        if (! $email) return null;

        $normalizado = strtolower(trim($email));

        if (! filter_var($normalizado, FILTER_VALIDATE_EMAIL)) return null;

        return hash('sha256', $normalizado);
    }

    /**
     * Phone: solo dígitos (incluye código de país) + sha256.
     * Si no tiene código de país asumimos Colombia (+57) por contexto del proyecto.
     */
    public static function phone(?string $phone): ?string
    {
        if (! $phone) return null;

        $digitos = preg_replace('/\D+/', '', $phone);

        if ($digitos === '') return null;

        // Si el número no incluye código de país (10 dígitos), asumimos +57 Colombia.
        if (strlen($digitos) === 10) {
            $digitos = '57' . $digitos;
        }

        return hash('sha256', $digitos);
    }

    /**
     * Nombre o apellido: trim + lowercase + sha256.
     */
    public static function nombre(?string $nombre): ?string
    {
        if (! $nombre) return null;

        $normalizado = strtolower(trim($nombre));

        if ($normalizado === '') return null;

        return hash('sha256', $normalizado);
    }

    /**
     * External ID (ID del cliente en el sistema): sha256 directo sin normalizar.
     * Se usa para matchear visitas anónimas con compras posteriores del mismo cliente.
     */
    public static function externalId(?string $id): ?string
    {
        if (! $id) return null;
        return hash('sha256', (string) $id);
    }
}
