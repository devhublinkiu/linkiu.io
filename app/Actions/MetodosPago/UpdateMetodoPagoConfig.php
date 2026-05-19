<?php

namespace App\Actions\MetodosPago;

use App\Models\MetodoPago;

class UpdateMetodoPagoConfig
{
    public function handle(MetodoPago $metodo, array $config): void
    {
        $metodo->update(['config' => $config ?: null]);
    }
}
