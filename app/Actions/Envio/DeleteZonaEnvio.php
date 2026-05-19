<?php

namespace App\Actions\Envio;

use App\Models\ZonaEnvio;

class DeleteZonaEnvio
{
    public function handle(ZonaEnvio $zona): void
    {
        $zona->delete();
    }
}
