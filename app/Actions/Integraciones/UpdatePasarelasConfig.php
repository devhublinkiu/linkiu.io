<?php

namespace App\Actions\Integraciones;

use App\Models\Integracion;

class UpdatePasarelasConfig
{
    public function handle(array $data): void
    {
        Integracion::set('mp_access_token_sandbox', $data['mp_access_token_sandbox'] ?: null);
        Integracion::set('mp_public_key_sandbox',   $data['mp_public_key_sandbox']   ?: null);
        Integracion::set('mp_access_token_prod',    $data['mp_access_token_prod']    ?: null);
        Integracion::set('mp_public_key_prod',      $data['mp_public_key_prod']      ?: null);
        Integracion::set('mp_webhook_secret',       $data['mp_webhook_secret']       ?: null);
        Integracion::set('mp_sandbox',              $data['mp_sandbox'] ? '1' : '0');
    }
}
