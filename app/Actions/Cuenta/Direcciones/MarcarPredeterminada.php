<?php

namespace App\Actions\Cuenta\Direcciones;

use App\Models\Client;
use App\Models\ClientAddress;
use Illuminate\Support\Facades\DB;

class MarcarPredeterminada
{
    /**
     * Marca una dirección como predeterminada y desmarca las demás del
     * cliente. Envuelve ambas operaciones en una transacción para evitar
     * que dos requests concurrentes dejen al cliente con cero o dos
     * predeterminadas.
     */
    public function execute(Client $cliente, ClientAddress $direccion): void
    {
        DB::transaction(function () use ($cliente, $direccion) {
            $cliente->addresses()->update(['predeterminada' => false]);
            $direccion->update(['predeterminada' => true]);
        });
    }
}
