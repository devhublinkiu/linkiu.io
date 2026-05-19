<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\OrdenEstadoCambiadoMail;
use App\Models\Order;
use App\Services\SendPulseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class OrdersController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('client')
            ->latest();

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('codigo', 'like', "%{$q}%")
                    ->orWhere('nombre', 'like', "%{$q}%")
                    ->orWhere('apellido', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $ordenes = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/ordenes/Index', [
            'ordenes'       => $ordenes,
            'filtroEstado'  => $request->estado ?? '',
            'filtroQ'       => $request->q ?? '',
            'totalPendientes' => Order::where('estado', 'pendiente')->count(),
        ]);
    }

    public function show(Order $order)
    {
        $order->load('items', 'client');

        return Inertia::render('admin/ordenes/Show', [
            'orden' => [
                'id'              => $order->id,
                'codigo'          => $order->codigo,
                'estado'          => $order->estado,
                'metodo_pago'     => $order->metodo_pago,
                'subtotal'        => $order->subtotal,
                'costo_envio'     => $order->costo_envio,
                'recargo'         => $order->recargo,
                'total'           => $order->total,
                'nombre'          => $order->nombre,
                'apellido'        => $order->apellido,
                'email'           => $order->email,
                'telefono'        => $order->telefono,
                'departamento'    => $order->departamento,
                'ciudad'          => $order->ciudad,
                'direccion'       => $order->direccion,
                'apartamento'     => $order->apartamento,
                'notas'           => $order->notas,
                'notas_internas'  => $order->notas_internas,
                'comprobante_url' => $order->comprobante_path
                    ? asset('storage/' . $order->comprobante_path)
                    : null,
                'created_at'      => $order->created_at->format('d/m/Y H:i'),
                'items'           => $order->items->map(fn ($i) => [
                    'id'       => $i->id,
                    'nombre'   => $i->producto_nombre,
                    'imagen'   => $i->producto_imagen,
                    'label'    => $i->label,
                    'cantidad' => $i->cantidad,
                    'precio'   => $i->precio_unitario,
                ]),
            ],
        ]);
    }

    public function updateEstado(Request $request, Order $order, SendPulseService $sendPulse)
    {
        $request->validate([
            'estado'         => 'required|in:pendiente,confirmado,preparando,enviado,entregado,cancelado',
            'numero_guia'    => 'nullable|string|max:100',
            'transportadora' => 'nullable|string|max:100',
        ]);

        $datos = ['estado' => $request->estado];
        if ($request->estado === 'enviado') {
            if ($request->filled('numero_guia'))    $datos['numero_guia']    = $request->numero_guia;
            if ($request->filled('transportadora')) $datos['transportadora'] = $request->transportadora;
        }

        $order->update($datos);

        // Broadcast en tiempo real a la página de seguimiento del cliente
        try {
            $ably = new \Ably\AblyRest(config('broadcasting.connections.ably.key'));
            $ably->channels->get('orders.' . $order->codigo)->publish('orden.actualizada', [
                'codigo'         => $order->codigo,
                'estado'         => $order->estado,
                'numero_guia'    => $order->numero_guia,
                'transportadora' => $order->transportadora,
            ]);
        } catch (\Exception $e) {
            \Log::error('Ably publish OrdenEstado: ' . $e->getMessage());
        }

        try {
            Mail::to($order->email)->send(new OrdenEstadoCambiadoMail($order));
        } catch (\Exception $e) {
            \Log::error('OrdenEstadoCambiadoMail: ' . $e->getMessage());
        }

        try {
            $sendPulse->notificarCambioEstado($order);
        } catch (\Exception $e) {
            \Log::error('SendPulse notificarCambioEstado: ' . $e->getMessage());
        }

        return back();
    }

    public function updateNotasInternas(Request $request, Order $order)
    {
        $request->validate([
            'notas_internas' => 'nullable|string|max:2000',
        ]);

        $order->update(['notas_internas' => $request->notas_internas]);

        return back();
    }
}
