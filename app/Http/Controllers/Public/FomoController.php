<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BuildConfig;
use App\Models\FomoViewLog;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FomoController extends Controller
{
    public function index(): JsonResponse
    {
        if (BuildConfig::get('fomo_enabled', 'false') !== 'true') {
            return response()->json([]);
        }

        $compras = Order::with('items')
            ->where('created_at', '>=', now()->subHours(48))
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn ($order) => [
                'tipo'     => 'compra',
                'nombre'   => $this->iniciales($order->nombre, $order->apellido),
                'ciudad'   => $order->ciudad,
                'producto' => $order->items->first()?->producto_nombre ?? '',
                'hace'     => $this->tiempoRelativo($order->created_at),
                '_ts'      => $order->created_at->timestamp,
            ])
            ->filter(fn ($c) => $c['producto'] !== '');

        $vistas = FomoViewLog::with('producto:id,nombre')
            ->where('created_at', '>=', now()->subHours(48))
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn ($log) => [
                'tipo'     => 'vista',
                'producto' => $log->producto?->nombre ?? '',
                'hace'     => $this->tiempoRelativo($log->created_at),
                '_ts'      => $log->created_at->timestamp,
            ])
            ->filter(fn ($v) => $v['producto'] !== '');

        $resultado = $compras->concat($vistas)
            ->sortByDesc('_ts')
            ->map(fn ($item) => array_diff_key($item, ['_ts' => '']))
            ->values();

        return response()->json($resultado);
    }

    public function logView(Request $request): JsonResponse
    {
        $request->validate(['producto_id' => 'required|integer|exists:productos,id']);

        FomoViewLog::create([
            'producto_id' => $request->producto_id,
            'created_at'  => now(),
        ]);

        if (rand(1, 20) === 1) {
            FomoViewLog::where('created_at', '<', now()->subHours(48))->delete();
        }

        return response()->json(['ok' => true]);
    }

    private function iniciales(string $nombre, ?string $apellido): string
    {
        $n = mb_substr(trim($nombre), 0, 1);
        $a = $apellido ? mb_substr(trim($apellido), 0, 1) . '.' : '';
        return mb_strtoupper($n) . '. ' . mb_strtoupper($a);
    }

    private function tiempoRelativo(\Carbon\Carbon $fecha): string
    {
        $minutos = (int) $fecha->diffInMinutes(now());
        if ($minutos < 1)   return 'ahora mismo';
        if ($minutos < 60)  return "hace {$minutos} min";
        $horas = (int) $fecha->diffInHours(now());
        if ($horas < 24)    return "hace {$horas} h";
        $dias = (int) $fecha->diffInDays(now());
        return "hace {$dias} día" . ($dias > 1 ? 's' : '');
    }
}
