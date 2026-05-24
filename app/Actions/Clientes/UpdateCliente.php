<?php

namespace App\Actions\Clientes;

use App\Models\Client;

class UpdateCliente
{
    public function execute(Client $cliente, array $datos): Client
    {
        $cliente->update([
            'nombre'   => $datos['nombre'],
            'apellido' => $datos['apellido'],
            'telefono' => $datos['telefono'],
        ]);

        return $cliente->fresh();
    }
}
