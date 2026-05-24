<?php

namespace App\Actions\Cuenta\Direcciones;

use App\Models\Client;
use App\Models\ClientAddress;

class ActualizarDireccion
{
    public function execute(Client $cliente, ClientAddress $direccion, array $datos): ClientAddress
    {
        $direccion->update([
            'etiqueta'     => $datos['etiqueta'] ?? null,
            'nombre'       => $cliente->nombre . ' ' . $cliente->apellido,
            'telefono'     => $cliente->telefono,
            'departamento' => $datos['departamento'],
            'ciudad'       => $datos['ciudad'],
            'direccion'    => $datos['direccion'],
            'apartamento'  => $datos['apartamento'] ?? null,
        ]);

        return $direccion->fresh();
    }
}
