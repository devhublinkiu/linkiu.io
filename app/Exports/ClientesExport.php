<?php

namespace App\Exports;

use App\Models\Client;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ClientesExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    public function query()
    {
        return Client::withCount('orders')
            ->withSum('orders', 'total')
            ->latest();
    }

    public function headings(): array
    {
        return [
            'ID', 'Nombre', 'Apellido', 'Email', 'Teléfono',
            'Tipo', '# Pedidos', 'Total gastado', 'Registrado',
        ];
    }

    public function map($client): array
    {
        return [
            $client->id,
            $client->nombre,
            $client->apellido,
            $client->email,
            $client->telefono,
            $client->password ? 'Con cuenta' : 'Invitado',
            $client->orders_count,
            $client->orders_sum_total ?? 0,
            $client->created_at->format('d/m/Y'),
        ];
    }
}
