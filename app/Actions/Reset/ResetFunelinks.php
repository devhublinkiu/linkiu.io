<?php

namespace App\Actions\Reset;

use App\Models\FomoViewLog;
use App\Models\FunelinksResetLog;
use App\Models\ProductView;
use App\Models\VisitanteSesion;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Borra datos de Funelinks en un rango. Opera sobre las 3 tablas que alimentan
 * las métricas (score/temperatura/tendencia/señal) según los flags.
 *
 *  - visitante_sesiones (Funelinks principal — recorrido y conversión)
 *  - product_views (contador histórico)
 *  - fomo_view_logs (badge "X personas vieron")
 *
 * Las órdenes NO se tocan acá — son materia del bulk delete específico.
 */
class ResetFunelinks
{
    /**
     * @return array{conteo_sesiones:int, conteo_visitas:int, conteo_fomo:int} Conteo real borrado.
     */
    public function execute(
        CarbonImmutable $desde,
        CarbonImmutable $hasta,
        ?int $productoId,
        bool $borrarSesiones,
        bool $borrarVisitas,
        bool $borrarFomo,
        string $motivo,
    ): array {
        $desdeInicio = $desde->startOfDay();
        $hastaFin    = $hasta->endOfDay();

        $countSesiones = 0;
        $countVisitas  = 0;
        $countFomo     = 0;

        DB::transaction(function () use (
            $desdeInicio, $hastaFin, $productoId,
            $borrarSesiones, $borrarVisitas, $borrarFomo,
            $motivo,
            &$countSesiones, &$countVisitas, &$countFomo,
        ) {
            if ($borrarSesiones) {
                $q = VisitanteSesion::query()
                    ->whereBetween('inicio', [$desdeInicio, $hastaFin]);
                if ($productoId) $q->where('producto_id', $productoId);
                $countSesiones = $q->delete();
            }

            if ($borrarVisitas) {
                $q = ProductView::query()
                    ->whereBetween('created_at', [$desdeInicio, $hastaFin]);
                if ($productoId) $q->where('producto_id', $productoId);
                $countVisitas = $q->delete();
            }

            if ($borrarFomo) {
                $q = FomoViewLog::query()
                    ->whereBetween('created_at', [$desdeInicio, $hastaFin]);
                if ($productoId) $q->where('producto_id', $productoId);
                $countFomo = $q->delete();
            }

            FunelinksResetLog::create([
                'rango_desde'      => $desdeInicio->toDateString(),
                'rango_hasta'      => $hastaFin->toDateString(),
                'producto_id'      => $productoId,
                'borrado_sesiones' => $borrarSesiones,
                'borrado_visitas'  => $borrarVisitas,
                'borrado_fomo'     => $borrarFomo,
                'conteo_sesiones'  => $countSesiones,
                'conteo_visitas'   => $countVisitas,
                'conteo_fomo'      => $countFomo,
                'motivo'           => $motivo,
                'ejecutado_por'    => Auth::id(),
                'ejecutado_at'     => now(),
            ]);
        });

        return [
            'conteo_sesiones' => $countSesiones,
            'conteo_visitas'  => $countVisitas,
            'conteo_fomo'     => $countFomo,
        ];
    }

    /**
     * Cuenta cuánto se borraría sin tocar BD — usado por el preview del UI.
     */
    public function preview(
        CarbonImmutable $desde,
        CarbonImmutable $hasta,
        ?int $productoId,
        bool $borrarSesiones,
        bool $borrarVisitas,
        bool $borrarFomo,
    ): array {
        $desdeInicio = $desde->startOfDay();
        $hastaFin    = $hasta->endOfDay();

        $base = function ($model, string $columnaFecha) use ($desdeInicio, $hastaFin, $productoId) {
            $q = $model::query()->whereBetween($columnaFecha, [$desdeInicio, $hastaFin]);
            if ($productoId) $q->where('producto_id', $productoId);
            return $q;
        };

        return [
            'conteo_sesiones' => $borrarSesiones ? $base(VisitanteSesion::class, 'inicio')->count()     : 0,
            'conteo_visitas'  => $borrarVisitas  ? $base(ProductView::class,     'created_at')->count() : 0,
            'conteo_fomo'     => $borrarFomo     ? $base(FomoViewLog::class,     'created_at')->count() : 0,
        ];
    }
}
