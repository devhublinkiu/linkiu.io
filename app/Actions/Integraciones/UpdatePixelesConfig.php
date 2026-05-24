<?php

namespace App\Actions\Integraciones;

use App\Models\Integracion;

class UpdatePixelesConfig
{
    private const KEYS = [
        'fb_pixel_id',
        'fb_test_event_code',
        'google_ads_id',
        'google_ads_purchase_label',
    ];

    public function handle(array $data): void
    {
        foreach (self::KEYS as $key) {
            $nuevo  = $data[$key] ?? null;
            $nuevo  = $nuevo === '' ? null : $nuevo;
            $actual = Integracion::get($key);

            // Solo escribir si el valor cambió. Evita updateOrCreate cuando no aporta
            // y reduce invalidaciones de cache innecesarias.
            if ($nuevo !== $actual) {
                Integracion::set($key, $nuevo);
            }
        }
    }
}
