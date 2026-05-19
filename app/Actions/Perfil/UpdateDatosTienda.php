<?php

namespace App\Actions\Perfil;

use App\Models\Integracion;

class UpdateDatosTienda
{
    public function handle(array $data): void
    {
        Integracion::set('tienda_telefono', $data['tienda_telefono'] ?: null);
    }
}
