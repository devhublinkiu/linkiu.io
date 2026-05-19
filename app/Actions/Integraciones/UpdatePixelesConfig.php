<?php

namespace App\Actions\Integraciones;

use App\Models\Integracion;

class UpdatePixelesConfig
{
    public function handle(array $data): void
    {
        Integracion::set('fb_pixel_id',        $data['fb_pixel_id']        ?: null);
        Integracion::set('fb_test_event_code', $data['fb_test_event_code'] ?: null);
        Integracion::set('google_ads_id',      $data['google_ads_id']      ?: null);
    }
}
