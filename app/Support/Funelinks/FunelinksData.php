<?php

namespace App\Support\Funelinks;

use App\Models\Order;
use App\Models\Producto;
use App\Models\ProductoHook;
use App\Models\VisitanteSesion;
use Illuminate\Support\Carbon;

/**
 * Recolecta data agregada de visitante_sesiones para el modulo Funelinks:
 * resumen, funnel del producto, comparativa por origen, por dispositivo.
 *
 * Filtros aceptados:
 *  - producto_id (int|null): null = todos los productos (raro, se prefiere uno)
 *  - periodo (string): 'hoy' | '7d' | '30d'  (default 7d)
 *  - origen (string|null): null = todos
 *
 * 100% puro: solo lectura de BD, sin side effects ni cache.
 */
class FunelinksData
{
    /** Conversion (% sesiones que terminaron en orden) bandas. */
    private const UMBRAL_BUENO = 10.0;
    private const UMBRAL_MEDIO = 5.0;

    /** Mapa de keys de hook a nombres es-CO (espejo del frontend). */
    private const NOMBRE_SECCION = [
        // Fijas arriba del fold del producto
        'galeria'                    => 'Galería',
        'detalle_compra'             => 'Detalle y compra',
        // Hooks ordenables abajo del fold
        'gancho_promesa'             => 'Gancho de promesa',
        'slider_imagenes'            => 'Slider de imágenes',
        'que_incluye'                => 'Qué incluye',
        'tabla_comparativa'          => 'Tabla comparativa',
        'comparacion_visual'         => 'Antes y después',
        'ficha_tecnica'              => 'Ficha técnica',
        'caracteristicas_destacadas' => 'Características',
        'como_funciona'              => 'Cómo funciona',
        'resenas_clientes'           => 'Reseñas',
        'galeria_resultados'         => 'Galería de resultados',
        'garantia'                   => 'Garantía',
        'preguntas_frecuentes'       => 'Preguntas frecuentes',
        'sellos_confianza'           => 'Sellos de confianza',
    ];

    /** Secciones fijas que siempre van al inicio del funnel. */
    private const FIJAS_INICIO = ['galeria', 'detalle_compra'];

    /** Hooks ordenables por default (el admin puede customizar en cada producto). */
    private const HOOKS_DEFAULT = [
        'gancho_promesa', 'slider_imagenes', 'que_incluye', 'tabla_comparativa',
        'comparacion_visual', 'ficha_tecnica', 'caracteristicas_destacadas',
        'como_funciona', 'resenas_clientes', 'galeria_resultados',
        'garantia', 'preguntas_frecuentes', 'sellos_confianza',
    ];

    /** Orden completo default = fijas + hooks default. */
    private const ORDEN_DEFAULT = [
        'galeria', 'detalle_compra',
        'gancho_promesa', 'slider_imagenes', 'que_incluye', 'tabla_comparativa',
        'comparacion_visual', 'ficha_tecnica', 'caracteristicas_destacadas',
        'como_funciona', 'resenas_clientes', 'galeria_resultados',
        'garantia', 'preguntas_frecuentes', 'sellos_confianza',
    ];

    public function todo(?int $productoId, string $periodo, ?string $origen): array
    {
        return [
            'resumen'           => $this->resumen($productoId, $periodo, $origen),
            'funnel'            => $this->funnel($productoId, $periodo, $origen),
            'por_origen'        => $this->porOrigen($productoId, $periodo),
            'por_dispositivo'   => $this->porDispositivo($productoId, $periodo, $origen),
            'productos'         => $this->productosDisponibles(),
            'filtros_activos'   => [
                'producto_id' => $productoId,
                'periodo'     => $periodo,
                'origen'      => $origen,
            ],
        ];
    }

    public function resumen(?int $productoId, string $periodo, ?string $origen): array
    {
        $q = $this->baseQuery($productoId, $periodo, $origen);

        $sesiones = (clone $q)->count();
        if ($sesiones === 0) {
            return [
                'sesiones'             => 0,
                'duracion_promedio'    => 0,
                'llego_al_final_pct'   => 0.0,
                'conversion_pct'       => 0.0,
            ];
        }

        $duracion       = (int) (clone $q)->avg('duracion_segundos');
        $llegoAlFinal   = (clone $q)->where('seccion_final', 'sellos_confianza')->count();
        $llegoAlFinalPct = round(($llegoAlFinal / $sesiones) * 100, 1);

        $conversionPct = $this->calcularConversion($productoId, $periodo, $sesiones);

        return [
            'sesiones'           => $sesiones,
            'duracion_promedio'  => $duracion,
            'llego_al_final_pct' => $llegoAlFinalPct,
            'conversion_pct'     => $conversionPct,
        ];
    }

    /**
     * Funnel por seccion del producto. Cuenta cuantas sesiones tienen cada
     * seccion en su recorrido. La sección con mayor drop_off se marca como
     * cuello.
     */
    public function funnel(?int $productoId, string $periodo, ?string $origen): array
    {
        $sesiones = $this->baseQuery($productoId, $periodo, $origen)
            ->whereNotNull('producto_id')
            ->get(['recorrido']);

        $total = $sesiones->count();
        if ($total === 0) return [];

        // Orden del funnel: si hay producto seleccionado, usar SU layout_orden
        // real (lo que el admin configuro en el editor). Si no hay producto o
        // no tiene layout custom, usar ORDEN_DEFAULT.
        $orden = $this->ordenDeProducto($productoId);

        // Contar visitas por seccion
        $countPorSeccion = [];
        foreach ($orden as $key) {
            $countPorSeccion[$key] = 0;
        }
        foreach ($sesiones as $s) {
            $rec = $s->recorrido ?: [];
            $visitadas = [];
            foreach ($rec as $paso) {
                $sec = $paso['s'] ?? null;
                if ($sec && isset($countPorSeccion[$sec])) {
                    $visitadas[$sec] = true;
                }
            }
            foreach ($visitadas as $sec => $_) {
                $countPorSeccion[$sec]++;
            }
        }

        // Calcular % y drop_off, detectar cuello
        $maxDropOff = 0.0;
        $cuello     = null;
        $previo     = $total;
        $items      = [];

        foreach ($orden as $key) {
            $count = $countPorSeccion[$key];
            $pct   = $total > 0 ? round(($count / $total) * 100, 1) : 0;
            $drop  = $previo > 0 ? round((($previo - $count) / $previo) * 100, 1) : 0;

            $items[] = [
                'key'        => $key,
                'nombre'     => self::NOMBRE_SECCION[$key] ?? $key,
                'count'      => $count,
                'porcentaje' => $pct,
                'drop_off'   => $drop,
                'es_cuello'  => false,  // se asigna luego
            ];

            // Solo considerar cuello si drop > 0 y no es la primera
            if (count($items) > 1 && $drop > $maxDropOff) {
                $maxDropOff = $drop;
                $cuello     = count($items) - 1;  // index del item actual
            }

            $previo = $count;
        }

        if ($cuello !== null && $maxDropOff >= 15) {
            $items[$cuello]['es_cuello'] = true;
        }

        return $items;
    }

    public function porOrigen(?int $productoId, string $periodo): array
    {
        return $this->comparativa($productoId, $periodo, null, 'origen', ['facebook', 'instagram', 'google', 'direct', 'otros']);
    }

    public function porDispositivo(?int $productoId, string $periodo, ?string $origen): array
    {
        return $this->comparativa($productoId, $periodo, $origen, 'dispositivo', ['movil', 'desktop', 'tablet']);
    }

    public function productosDisponibles(): array
    {
        // Productos que tienen al menos 1 sesion registrada
        $ids = VisitanteSesion::query()
            ->whereNotNull('producto_id')
            ->distinct()
            ->pluck('producto_id')
            ->toArray();

        if (empty($ids)) {
            // Fallback: todos los productos activos
            $ids = Producto::query()->where('status', 'activo')->pluck('id')->toArray();
        }

        return Producto::query()
            ->whereIn('id', $ids)
            ->orderBy('nombre')
            ->get(['id', 'nombre'])
            ->map(fn ($p) => ['id' => $p->id, 'nombre' => $p->nombre])
            ->toArray();
    }

    // ─────────────────────────────────────────────────────────────────────

    /**
     * Devuelve el orden completo del funnel: fijas arriba del fold +
     * hooks ordenables ACTIVOS. Si el producto tiene layout_orden custom,
     * lo usamos para los hooks. Si no, HOOKS_DEFAULT.
     *
     * Filtramos hooks inactivos — al cliente nunca se le mostraron, así que
     * tampoco deben aparecer en el funnel (genera la ilusión de drop-off
     * sobre una sección que ni siquiera estaba en la página).
     *
     * Las fijas (galeria, detalle_compra) siempre van primero (no son hooks
     * toggleables — son las dos secciones above-the-fold del producto).
     */
    private function ordenDeProducto(?int $productoId): array
    {
        $hooks = self::HOOKS_DEFAULT;

        if ($productoId) {
            $layout = Producto::query()->where('id', $productoId)->value('layout_orden');
            if (is_array($layout) && ! empty($layout)) {
                $valido = array_values(array_intersect($layout, self::HOOKS_DEFAULT));
                if (! empty($valido)) $hooks = $valido;
            }

            // Filtrar a solo los hooks activos del producto. Si un hook no
            // tiene registro en producto_hooks, asumimos inactivo (default).
            $activos = ProductoHook::query()
                ->where('producto_id', $productoId)
                ->where('activo', true)
                ->pluck('hook_key')
                ->toArray();

            $hooks = array_values(array_intersect($hooks, $activos));
        }

        return array_merge(self::FIJAS_INICIO, $hooks);
    }

    private function baseQuery(?int $productoId, string $periodo, ?string $origen)
    {
        $q = VisitanteSesion::query()->where('inicio', '>=', $this->fechaDesde($periodo));
        if ($productoId) $q->where('producto_id', $productoId);
        if ($origen)     $q->where('origen', $origen);
        return $q;
    }

    private function fechaDesde(string $periodo): Carbon
    {
        return match ($periodo) {
            'hoy' => Carbon::today(),
            '30d' => Carbon::now()->subDays(30),
            default => Carbon::now()->subDays(7),
        };
    }

    /**
     * Comparativa generica por columna (origen o dispositivo). Para cada
     * valor del set fijo devuelve sus stats y estado bueno/medio/bajo segun
     * conversion.
     */
    private function comparativa(?int $productoId, string $periodo, ?string $origen, string $columna, array $valores): array
    {
        $base = $this->baseQuery($productoId, $periodo, $origen);

        $items = [];
        foreach ($valores as $valor) {
            $q = (clone $base)->where($columna, $valor);
            $sesiones = $q->count();

            if ($sesiones === 0) {
                $items[] = [
                    'valor'             => $valor,
                    'sesiones'          => 0,
                    'duracion_promedio' => 0,
                    'llego_al_final'    => 0,
                    'conversion'        => 0.0,
                    'estado'            => 'bajo',
                ];
                continue;
            }

            $duracion        = (int) (clone $q)->avg('duracion_segundos');
            $llegoAlFinal    = (clone $q)->where('seccion_final', 'sellos_confianza')->count();
            $llegoAlFinalPct = round(($llegoAlFinal / $sesiones) * 100, 1);

            // Conversion: ordenes en periodo / sesiones de este filtro.
            // Es una proxy agregada — no asocia 1:1 sesion con orden, pero da
            // una idea de la calidad del trafico de cada origen/dispositivo.
            $conversion = $this->calcularConversion($productoId, $periodo, $sesiones);

            $items[] = [
                'valor'             => $valor,
                'sesiones'          => $sesiones,
                'duracion_promedio' => $duracion,
                'llego_al_final'    => $llegoAlFinalPct,
                'conversion'        => $conversion,
                'estado'            => $this->estadoSegunConversion($conversion),
            ];
        }

        return $items;
    }

    private function calcularConversion(?int $productoId, string $periodo, int $sesiones): float
    {
        if ($sesiones === 0) return 0.0;

        $q = Order::query()
            ->where('created_at', '>=', $this->fechaDesde($periodo))
            ->where('estado', '!=', 'cancelado');

        if ($productoId) {
            $q->whereHas('items', fn ($iq) => $iq->where('producto_id', $productoId));
        }

        $ordenes = $q->count();
        return round(($ordenes / $sesiones) * 100, 1);
    }

    private function estadoSegunConversion(float $conv): string
    {
        if ($conv >= self::UMBRAL_BUENO) return 'bueno';
        if ($conv >= self::UMBRAL_MEDIO) return 'medio';
        return 'bajo';
    }
}
