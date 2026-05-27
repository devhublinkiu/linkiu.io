<?php

namespace Database\Seeders;

use App\Models\MetodoPago;
use Illuminate\Database\Seeder;

class MetodosPagoSeeder extends Seeder
{
    public function run(): void
    {
        $metodos = [
            [
                'clave'       => 'mercadopago',
                'nombre'      => 'Mercado Pago',
                'descripcion' => 'Pago en línea con tarjeta, PSE, Nequi y efectivo vía Mercado Pago.',
                'activo'      => false,
                'orden'       => 1,
            ],
            [
                'clave'       => 'bold',
                'nombre'      => 'Bold',
                'descripcion' => 'Pago en línea con tarjeta, PSE, Nequi, Bancolombia y QR vía Bold.',
                'activo'      => false,
                'orden'       => 2,
            ],
            [
                'clave'       => 'contraentrega',
                'nombre'      => 'Contraentrega',
                'descripcion' => 'El cliente paga en efectivo al recibir el pedido.',
                'activo'      => false,
                'orden'       => 3,
            ],
            [
                'clave'       => 'transferencia',
                'nombre'      => 'Transferencia bancaria',
                'descripcion' => 'El cliente transfiere y sube el comprobante de pago.',
                'activo'      => false,
                'orden'       => 4,
            ],
        ];

        foreach ($metodos as $metodo) {
            MetodoPago::firstOrCreate(['clave' => $metodo['clave']], $metodo);
        }
    }
}
