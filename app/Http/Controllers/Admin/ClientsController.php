<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Clientes\UpdateCliente;
use App\Http\Controllers\Controller;
use App\Jobs\EnviarEmailAdminAClienteJob;
use App\Models\Client;
use App\Models\Order;
use App\Support\CsvStreamExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ClientsController extends Controller
{
    public function index(Request $request)
    {
        abort_if(! auth()->user()->can('clientes.ver'), 403);

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
        abort_if(! auth()->user()->can('clientes.ver'), 403);

        // Agregados pesados (count, sum, JOIN producto_top) cacheados 15min.
        // OrderObserver invalida la key en cualquier saved/deleted del
        // cliente, así que el cache nunca queda mostrando datos viejos
        // tras un cambio real.
        $stats = Cache::remember(Client::cacheKeyStats($client->id), 900, function () use ($client) {
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

            return [
                'total_ordenes' => $client->orders()->count(),
                'total_gastado' => (int) $client->orders()->sum('total'),
                'producto_top'  => $productoTop ? [
                    'nombre'   => $productoTop->producto_nombre,
                    'imagen'   => $productoTop->producto_imagen,
                    'cantidad' => (int) $productoTop->total_cantidad,
                ] : null,
            ];
        });

        $ordenes = $client->orders()
            ->select('id', 'codigo', 'estado', 'total', 'metodo_pago', 'created_at')
            ->latest()
            ->get();

        return Inertia::render('admin/clientes/Show', [
            'cliente' => [
                'id'            => $client->id,
                'nombre'        => $client->nombre,
                'apellido'      => $client->apellido,
                'email'         => $client->email,
                'telefono'      => $client->telefono,
                'tiene_cuenta'  => $client->tiene_cuenta,
                'created_at'    => $client->created_at->format('d/m/Y'),
                'total_ordenes' => $stats['total_ordenes'],
                'total_gastado' => $stats['total_gastado'],
                'producto_top'  => $stats['producto_top'],
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

    public function update(Request $request, Client $client, UpdateCliente $action)
    {
        abort_if(! auth()->user()->can('clientes.editar'), 403);

        $datos = $request->validate([
            'nombre'   => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'telefono' => 'required|string|max:30',
        ]);

        $action->execute($client, $datos);

        return back()->with('status', 'Cliente actualizado.');
    }

    /**
     * Exporta los clientes a CSV (UTF-8 con BOM). Stream con chunk(500)
     * para soportar bases grandes sin agotar memoria.
     */
    public function export(): StreamedResponse
    {
        abort_if(! auth()->user()->can('clientes.ver'), 403);

        $query = Client::withCount('orders')
            ->withSum('orders', 'total')
            ->latest();

        $filename = 'clientes-' . now()->format('Y-m-d-His') . '.csv';

        $headings = [
            'ID', 'Nombre', 'Apellido', 'Email', 'Teléfono',
            'Tipo', '# Pedidos', 'Total gastado', 'Registrado',
        ];

        return CsvStreamExport::stream($filename, $headings, function (callable $write) use ($query) {
            $query->chunk(500, function ($clientes) use ($write) {
                foreach ($clientes as $cliente) {
                    $write([
                        $cliente->id,
                        $cliente->nombre,
                        $cliente->apellido,
                        $cliente->email,
                        $cliente->telefono,
                        $cliente->tiene_cuenta ? 'Con cuenta' : 'Invitado',
                        $cliente->orders_count,
                        $cliente->orders_sum_total ?? 0,
                        $cliente->created_at->format('d/m/Y'),
                    ]);
                }
            });
        });
    }

    public function sendEmail(Request $request, Client $client)
    {
        abort_if(! auth()->user()->can('clientes.editar'), 403);

        $request->validate([
            'asunto'   => 'required|string|max:200',
            'mensaje'  => 'required|string|max:5000',
        ]);

        EnviarEmailAdminAClienteJob::dispatch($client, $request->asunto, $request->mensaje);

        return back()->with('status', 'Email encolado para envío.');
    }
}
