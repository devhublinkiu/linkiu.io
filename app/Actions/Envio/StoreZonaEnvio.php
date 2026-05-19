<?php

namespace App\Actions\Envio;

use App\Models\ZonaEnvio;

class StoreZonaEnvio
{
    public function handle(array $data): ZonaEnvio
    {
        return ZonaEnvio::create($data);
    }
}
