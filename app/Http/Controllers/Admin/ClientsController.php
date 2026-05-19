<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AdminEmailClienteMail;
use App\Models\Client;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ClientesExport;

class ClientsController extends Controller
{
    public function index(Request $request)
    {
        $sortBy  = in_array($request->sortBy, ['orders_count', 'orders_sum_total', 'created_at']) ? $request->sortBy : 'created_at';
        $sortDir = $request->sortDir === 'asc' ? 'asc' : 'desc';

        $query = Client::withCount('orders')
            ->withSum('orders', 'total')
            ->withMax('orders', 'created_at')
            ->addSelect([
                'clients.*',
                'ultima_ciudad' => Order::select('ciudad')
                    ->whereColumn('client_id', 'clients.id')
                    ->latest()
                    ->limit(1),
                'ultimo_estado' => Order::select('estado')
                    ->whereColumn('client_id', 'clients.id')
                    ->latest()
                    ->limit(1),
            ])
            ->orderBy($sortBy, $sortDir);

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('nombre', 'like', "%{$q}%")
                    ->orWhere('apellido', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('telefono', 'like', "%{$q}%");
            });
        }

        if ($request->filled('tipo')) {
            if ($request->tipo === 'cuenta') {
                $query->whereNotNull('password');
            } elseif ($request->tipo === 'invitado') {
                $query->whereNull('password');
            }
        }

        $clientes = $query->paginate(25)->withQueryString();

        $clientes->getCollection()->transform(function ($c) {
            $c->tiene_cuenta = ! is_null($c->getRawOriginal('password'));
            return $c;
        });

        $totalConCuenta  = Client::whereNotNull('password')->count();
        $totalRecaudado  = Order::sum('total');

        return Inertia::render('admin/clientes/Index', [
            'clientes'        => $clientes,
            'filtroQ'         => $request->q ?? '',
            'filtroTipo'      => $request->tipo ?? '',
            'sortBy'          => $sortBy,
            'sortDir'         => $sortDir,
            'total'           => Client::count(),
            'totalConCuenta'  => $totalConCuenta,
            'totalRecaudado'  => $totalRecaudado,
        ]);
    }

    public function show(Client $client)
    {
        $client->loadCount('orders')->loadSum('orders', 'total');

        $ordenes = $client->orders()
            ->select('id', 'codigo', 'estado', 'total', 'metodo_pago', 'created_at')
            ->latest()
            ->get();

        $productoTop = $client->orders()
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->select(
                'order_items.producto_nombre',
                'order_items.producto_imagen',
                DB::raw('SUM(order_items.cantidad) as total_cantidad')
            )
            ->groupBy('order_items.producto_nombre', 'order_items.producto_imagen')
            ->orderByDesc('total_cantidad')
            ->first();

        return Inertia::render('admin/clientes/Show', [
            'cliente' => [
                'id'            => $client->id,
                'nombre'        => $client->nombre,
                'apellido'      => $client->apellido,
                'email'         => $client->email,
                'telefono'      => $client->telefono,
                'tiene_cuenta'  => ! is_null($client->password),
                'created_at'    => $client->created_at->format('d/m/Y'),
                'total_ordenes' => $client->orders_count,
                'total_gastado' => $client->orders_sum_total ?? 0,
                'producto_top'  => $productoTop ? [
                    'nombre'   => $productoTop->producto_nombre,
                    'imagen'   => $productoTop->producto_imagen,
                    'cantidad' => (int) $productoTop->total_cantidad,
                ] : null,
            ],
            'ordenes' => $ordenes->map(fn ($o) => [
                'id'          => $o->id,
                'codigo'      => $o->codigo,
                'estado'      => $o->estado,
                'total'       => $o->total,
                'metodo_pago' => $o->metodo_pago,
                'created_at'  => $o->created_at->format('d/m/Y H:i'),
            ]),
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $request->validate([
            'nombre'   => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'telefono' => 'required|string|max:30',
        ]);

        $client->update($request->only('nombre', 'apellido', 'telefono'));

        return back();
    }

    public function export()
    {
        return Excel::download(new ClientesExport, 'clientes-' . now()->format('Y-m-d') . '.xlsx');
    }

    public function sendEmail(Request $request, Client $client)
    {
        $request->validate([
            'asunto'   => 'required|string|max:200',
            'mensaje'  => 'required|string|max:5000',
        ]);

        Mail::to($client->email)->send(
            new AdminEmailClienteMail($client, $request->asunto, $request->mensaje)
        );

        return back();
    }
}
