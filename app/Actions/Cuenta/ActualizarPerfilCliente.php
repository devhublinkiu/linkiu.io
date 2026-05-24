<?php

namespace App\Actions\Cuenta;

use App\Models\Client;

class ActualizarPerfilCliente
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
