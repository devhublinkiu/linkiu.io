<?php

namespace App\Actions\Cuenta\Direcciones;

use App\Models\Client;
use App\Models\ClientAddress;
use Illuminate\Support\Facades\DB;

class CrearDireccion
{
    /**
     * Crea una dirección para el cliente. Si es su primera dirección, la
     * marca como predeterminada automáticamente. Si el caller pidió que
     * sea predeterminada, antes de crearla desmarca cualquier otra que ya
     * lo fuera — todo dentro de una transacción para evitar tener cero o
     * dos predeterminadas en concurrencia.
     */
    public function execute(Client $cliente, array $datos): ClientAddress
    {
        return DB::transaction(function () use ($cliente, $datos) {
            $esPrimera         = $cliente->addresses()->count() === 0;
            $marcarPredeterminada = $esPrimera || ! empty($datos['predeterminada']);

            if ($marcarPredeterminada) {
                $cliente->addresses()
                    ->where('predeterminada', true)
                    ->update(['predeterminada' => false]);
            }

            return $cliente->addresses()->create([
                'etiqueta'       => $datos['etiqueta'] ?? null,
                'nombre'         => $cliente->nombre . ' ' . $cliente->apellido,
                'telefono'       => $cliente->telefono,
                'departamento'   => $datos['departamento'],
                'ciudad'         => $datos['ciudad'],
                'direccion'      => $datos['direccion'],
                'apartamento'    => $datos['apartamento'] ?? null,
                'predeterminada' => $marcarPredeterminada,
            ]);
        });
    }
}
