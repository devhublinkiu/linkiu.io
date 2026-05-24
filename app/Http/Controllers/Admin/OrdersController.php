<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Orders\UpdateOrderEstado;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\CsvStreamExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrdersController extends Controller
{
    public function index(Request $request)
    {
        abort_if(! auth()->user()->can('ordenes.ver'), 403);

        $query = Order::with('client')->latest();

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
            'ordenes'         => $ordenes,
            'filtroEstado'    => $request->estado ?? '',
            'filtroQ'         => $request->q ?? '',
            'totalPendientes' => Order::countPendientes(),
        ]);
    }

    public function show(Order $order)
    {
        abort_if(! auth()->user()->can('ordenes.ver'), 403);

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
                'comprobante_url' => $this->urlComprobante($order),
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

    public function updateEstado(Request $request, Order $order, UpdateOrderEstado $action)
    {
        abort_if(! auth()->user()->can('ordenes.editar'), 403);

        $data = $request->validate([
            'estado'              => 'required|in:pendiente,confirmado,preparando,enviado,entregado,cancelado',
            'numero_guia'         => 'nullable|string|max:100',
            'transportadora'      => 'nullable|string|max:100',
            'motivo_cancelacion'  => 'nullable|string|max:500',
        ]);

        $action->execute(
            $order,
            $data['estado'],
            $data['numero_guia']        ?? null,
            $data['transportadora']     ?? null,
            $data['motivo_cancelacion'] ?? null,
        );

        return back()->with('status', 'Estado actualizado.');
    }

    /**
     * Genera una URL temporal (15min) para el comprobante. Funciona en S3
     * nativo y cae a URL pública directa con disco local (sin signed URL).
     * Cuando se migre a S3 (Fase 2), la URL será automáticamente firmada.
     */
    /**
     * Genera URL temporal de 15min para el comprobante en S3.
     * Para comprobantes legacy en disco public (pre-Fase 2) cae a URL pública.
     */
    private function urlComprobante(Order $order): ?string
    {
        if (! $order->comprobante_path) {
            return null;
        }

        try {
            return Storage::disk('s3')->temporaryUrl(
                $order->comprobante_path,
                now()->addMinutes(15),
            );
        } catch (\Throwable $e) {
            return asset('storage/' . $order->comprobante_path);
        }
    }

    /**
     * Exporta las órdenes filtradas a CSV (UTF-8 con BOM para Excel/Sheets).
     * Stream para soportar miles de registros sin agotar memoria.
     */
    public function export(Request $request): StreamedResponse
    {
        abort_if(! auth()->user()->can('ordenes.ver'), 403);

        $query = Order::with('items')->latest();

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

        $filename = 'ordenes-' . now()->format('Y-m-d-His') . '.csv';

        $headings = [
            'Código', 'Estado', 'Cliente', 'Email', 'Teléfono',
            'Ciudad', 'Departamento', 'Dirección',
            'Método pago', 'Subtotal', 'Envío', 'Recargo', 'Total',
            'Productos', 'Fecha',
        ];

        return CsvStreamExport::stream($filename, $headings, function (callable $write) use ($query) {
            $query->chunk(500, function ($ordenes) use ($write) {
                foreach ($ordenes as $orden) {
                    $productos = $orden->items
                        ->map(fn ($i) => "{$i->cantidad}× {$i->producto_nombre}")
                        ->implode(' | ');

                    $write([
                        $orden->codigo,
                        $orden->estado,
                        "{$orden->nombre} {$orden->apellido}",
                        $orden->email,
                        $orden->telefono,
                        $orden->ciudad,
                        $orden->departamento,
                        $orden->direccion . ($orden->apartamento ? " · {$orden->apartamento}" : ''),
                        $orden->metodo_pago,
                        $orden->subtotal,
                        $orden->costo_envio,
                        $orden->recargo,
                        $orden->total,
                        $productos,
                        $orden->created_at->format('Y-m-d H:i'),
                    ]);
                }
            });
        });
    }

    public function updateNotasInternas(Request $request, Order $order)
    {
        abort_if(! auth()->user()->can('ordenes.editar'), 403);

        $request->validate([
            'notas_internas' => 'nullable|string|max:2000',
        ]);

        $order->update(['notas_internas' => $request->notas_internas]);

        return back()->with('status', 'Notas guardadas.');
    }
}
