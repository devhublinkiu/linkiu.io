<?php

namespace App\Http\Controllers\Public;

use App\Actions\Orders\CrearOrden;
use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\CrearOrdenRequest;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function store(CrearOrdenRequest $request, CrearOrden $action): Response
    {
        $orden = $action->execute($request->validated(), $request->file('comprobante'));

        return Inertia::render('public/OrdenConfirmacion', [
            'codigo'       => $orden->codigo,
            'acceso_token' => $orden->acceso_token,
            'nombre'       => $orden->nombre,
            'email'        => $orden->email,
            'telefono'     => $orden->telefono,
            'total'        => $orden->total,
        ]);
    }

    public function confirmacion(Order $order): Response
    {
        return Inertia::render('public/OrdenConfirmacion', [
            'codigo'       => $order->codigo,
            'acceso_token' => $order->acceso_token,
            'nombre'       => $order->nombre,
            'email'        => $order->email,
            'telefono'     => $order->telefono,
            'total'        => $order->total,
        ]);
    }

    public function seguimiento(Order $order): Response
    {
        $orden = $order->load('items');

        return Inertia::render('public/OrdenSeguimiento', [
            'orden' => [
                'codigo'         => $orden->codigo,
                'estado'         => $orden->estado,
                'nombre'         => $orden->nombre,
                'ciudad'         => $orden->ciudad,
                'departamento'   => $orden->departamento,
                'metodo_pago'    => $orden->metodo_pago,
                'subtotal'       => $orden->subtotal,
                'costo_envio'    => $orden->costo_envio,
                'recargo'        => $orden->recargo,
                'total'          => $orden->total,
                'numero_guia'    => $orden->numero_guia,
                'transportadora' => $orden->transportadora,
                'created_at'     => $orden->created_at->format('d/m/Y H:i'),
                'items'          => $orden->items->map(fn ($i) => [
                    'nombre'   => $i->producto_nombre,
                    'imagen'   => $i->producto_imagen,
                    'label'    => $i->label,
                    'cantidad' => $i->cantidad,
                    'precio'   => $i->precio_unitario,
                ]),
            ],
        ]);
    }
}
