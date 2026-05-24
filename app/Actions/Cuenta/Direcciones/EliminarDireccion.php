<?php

namespace App\Actions\Cuenta\Direcciones;

use App\Models\Client;
use App\Models\ClientAddress;
use Illuminate\Support\Facades\DB;

class EliminarDireccion
{
    /**
     * Elimina la dirección. Si era la predeterminada, asigna la dirección
     * más antigua restante como nueva predeterminada — dentro de una
     * transacción para que no quede el cliente sin ninguna predeterminada
     * si dos requests concurrentes eliminan al mismo tiempo.
     */
    public function execute(Client $cliente, ClientAddress $direccion): void
    {
        DB::transaction(function () use ($cliente, $direccion) {
            $eraPredeterminada = $direccion->predeterminada;

            $direccion->delete();

            if ($eraPredeterminada) {
                $cliente->addresses()
                    ->oldest()
                    ->first()
                    ?->update(['predeterminada' => true]);
            }
        });
    }
}
