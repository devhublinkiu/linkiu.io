<?php

namespace App\Actions\Integraciones;

use App\Models\Integracion;

class UpdatePixelesConfig
{
    private const KEYS = [
        'fb_pixel_id',
        'fb_access_token',
        'google_ads_id',
        'google_ads_purchase_label',
    ];

    // Sentinel que la UI envía cuando hay token guardado pero el admin no lo tocó.
    // Significa "mantener el valor actual" — sin reescribirlo.
    private const TOKEN_NO_CAMBIAR = '***';

    public function handle(array $data): void
    {
        foreach (self::KEYS as $key) {
            $nuevo  = $data[$key] ?? null;
            $nuevo  = $nuevo === '' ? null : $nuevo;

            // Caso especial token: si el frontend manda el sentinel, no tocamos.
            if ($key === 'fb_access_token' && $nuevo === self::TOKEN_NO_CAMBIAR) {
                continue;
            }

            $actual = Integracion::get($key);

            // Solo escribir si el valor cambió. Evita updateOrCreate cuando no aporta
            // y reduce invalidaciones de cache innecesarias.
            if ($nuevo !== $actual) {
                Integracion::set($key, $nuevo);
            }
        }
    }
}
