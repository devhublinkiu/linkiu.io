<?php

namespace App\Antifraude\Reglas;

use App\Models\ClienteBlacklist as ClienteBlacklistModel;
use App\Models\Order;

/**
 * Detecta si el teléfono o el email de la orden están en la blacklist
 * que el admin gestiona manualmente. Match exacto contra `clientes_blacklist`.
 */
class ClienteBlacklist implements Regla
{
    public function clave(): string
    {
        return 'cliente_blacklist';
    }

    public function evaluar(Order $orden, ?array $parametros): bool
    {
        $telefono = preg_replace('/\D+/', '', (string) $orden->telefono);

        return ClienteBlacklistModel::query()
            ->where(function ($q) use ($orden, $telefono) {
                $q->where(fn ($qq) => $qq->where('tipo', 'email')->where('valor', $orden->email));
                if ($telefono !== '') {
                    $q->orWhere(fn ($qq) => $qq->where('tipo', 'telefono')->where('valor', $telefono));
                }
            })
            ->exists();
    }
}
