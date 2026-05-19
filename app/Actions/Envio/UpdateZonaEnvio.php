<?php

namespace App\Actions\Envio;

use App\Models\ZonaEnvio;

class UpdateZonaEnvio
{
    public function handle(ZonaEnvio $zona, array $data): void
    {
        $zona->update($data);
    }
}
