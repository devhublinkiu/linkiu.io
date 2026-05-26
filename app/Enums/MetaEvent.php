<?php

namespace App\Enums;

/**
 * Eventos válidos para enviar a Conversions API de Meta.
 *
 * Whitelist defensiva: el endpoint público acepta solo estos eventos.
 * Bloquea inyección de eventos custom maliciosos o malformados.
 *
 * Ref: https://developers.facebook.com/docs/meta-pixel/reference#standard-events
 */
enum MetaEvent: string
{
    case ViewContent      = 'ViewContent';
    case AddToCart        = 'AddToCart';
    case InitiateCheckout = 'InitiateCheckout';
    case AddPaymentInfo   = 'AddPaymentInfo';
    case Purchase         = 'Purchase';
    case Lead             = 'Lead';

    public static function values(): array
    {
        return array_map(fn ($c) => $c->value, self::cases());
    }
}
