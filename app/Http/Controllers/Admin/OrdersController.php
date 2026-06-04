<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Antifraude\AprobarOrden;
use App\Actions\Antifraude\RechazarOrden;
use App\Actions\Orders\EnviarConfirmacionCod;
use App\Actions\Orders\UpdateOrderEstado;
use App\Actions\Reset\EliminarOrdenes;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reset\EliminarOrdenesRequest;
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

        // Filtro Antifraude (independiente del estado). Solo activo cuando se
        // pasa `revision=pendiente` desde el tab nuevo del Index.
        if ($request->filled('revision')) {
            $query->where('revision_estado', $request->revision);
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

        $ordenes = $query->paginate(20)
            ->withQueryString()
            ->through(fn ($o) => [
                'id'                         => $o->id,
                'codigo'                     => $o->codigo,
                'estado'                     => $o->estado,
                'nombre'                     => $o->nombre,
                'apellido'                   => $o->apellido,
                'email'                      => $o->email,
                'ciudad'                     => $o->ciudad,
                'total'                      => $o->total,
                'metodo_pago'                => $o->metodo_pago,
                'created_at'                 => $o->created_at?->toIso8601String(),
                'revision_estado'            => $o->revision_estado,
                'revision_motivos'           => $o->revision_motivos,
                'confirmacion_solicitada_at' => $o->confirmacion_solicitada_at?->toIso8601String(),
                'confirmacion_reenviada'     => (bool) $o->confirmacion_reenviada,
                'confirmacion_respondida_at' => $o->confirmacion_respondida_at?->toIso8601String(),
                'confirmacion_respuesta'     => $o->confirmacion_respuesta,
            ]);

        return Inertia::render('admin/ordenes/Index', [
            'ordenes'         => $ordenes,
            'filtroEstado'    => $request->estado ?? '',
            'filtroRevision'  => $request->revision ?? '',
            'filtroQ'         => $request->q ?? '',
            'totalPendientes' => Order::countPendientes(),
            'totalRevision'   => Order::countRevisionPendiente(),
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
                'revision_estado'      => $order->revision_estado,
                'revision_motivos'     => $order->revision_motivos,
                'revision_revisada_at' => $order->revision_revisada_at?->format('d/m/Y H:i'),
                'revision_comentario'  => $order->revision_comentario,
                'confirmacion_solicitada_at' => $order->confirmacion_solicitada_at?->toIso8601String(),
                'confirmacion_reenviada'     => (bool) $order->confirmacion_reenviada,
                'confirmacion_respondida_at' => $order->confirmacion_respondida_at?->format('d/m/Y H:i'),
                'confirmacion_respuesta'     => $order->confirmacion_respuesta,
            ],
        ]);
    }

    /**
     * Bulk delete de órdenes — solo super-admin. Genera audit log inmutable.
     * Hard delete: borra orders + items + comprobantes S3. No reversible salvo
     * por restore desde backup. La auth y validación viven en EliminarOrdenesRequest.
     */
    public function bulkDestroy(EliminarOrdenesRequest $request, EliminarOrdenes $action)
    {
        $eliminadas = $action->execute(
            ids:    $request->validated('ids'),
            motivo: $request->validated('motivo'),
        );

        return back()->with('status', "{$eliminadas} órdenes eliminadas.");
    }

    public function updateEstado(Request $request, Order $order, UpdateOrderEstado $action)
    {
        abort_if(! auth()->user()->can('ordenes.editar'), 403);

        $data = $request->validate([
            // 'preparando' se mantiene en BD para compatibilidad con órdenes
            // existentes pero está oculto del UI mientras se piensa la mejora.
            // 'devuelto' es nuevo (Capa 3) para casos COD post-entrega.
            'estado'              => 'required|in:pendiente,confirmado,preparando,enviado,entregado,cancelado,devuelto',
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

    /**
     * Aprueba la revisión antifraude — la orden vuelve al flujo normal.
     * Requiere ordenes.editar (no creamos permiso nuevo solo para esto).
     */
    public function aprobarRevision(Request $request, Order $order, AprobarOrden $action)
    {
        abort_if(! auth()->user()->can('ordenes.editar'), 403);
        abort_unless($order->revision_estado === 'pendiente', 422, 'La orden no está bajo revisión.');

        $data = $request->validate([
            'comentario' => 'nullable|string|max:500',
        ]);

        $action->execute($order, $data['comentario'] ?? null);

        return back()->with('status', 'Orden aprobada.');
    }

    /**
     * Rechaza la revisión antifraude y cancela la orden. Delega el cambio de
     * estado a UpdateOrderEstado → dispara order_cancelled al cliente.
     */
    /**
     * Reenvía la plantilla de confirmación COD al cliente. Solo 1 reenvío por
     * orden — la UI oculta el botón cuando `confirmacion_reenviada = true`.
     */
    public function reenviarConfirmacion(Order $order, EnviarConfirmacionCod $action)
    {
        abort_if(! auth()->user()->can('ordenes.editar'), 403);
        abort_unless($order->metodo_pago === 'contraentrega', 422, 'Solo aplica a órdenes contraentrega.');
        abort_if($order->confirmacion_reenviada, 422, 'Ya se reenvió una vez. No se permite más.');
        abort_if($order->confirmacion_respondida_at !== null, 422, 'El cliente ya respondió.');

        $action->execute($order, esReenvio: true);

        return back()->with('status', 'Confirmación reenviada al cliente.');
    }

    public function rechazarRevision(Request $request, Order $order, RechazarOrden $action)
    {
        abort_if(! auth()->user()->can('ordenes.editar'), 403);
        abort_unless($order->revision_estado === 'pendiente', 422, 'La orden no está bajo revisión.');

        $data = $request->validate([
            'comentario' => 'required|string|max:500',
        ]);

        $action->execute($order, $data['comentario']);

        return back()->with('status', 'Orden rechazada y cancelada.');
    }
}
