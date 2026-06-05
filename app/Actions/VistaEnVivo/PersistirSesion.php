<?php

namespace App\Actions\VistaEnVivo;

use App\Models\Producto;
use App\Models\VisitanteSesion;
use App\Support\VistaEnVivo\Visitante;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Persiste un Visitante (al momento de su desconexion) en la tabla
 * visitante_sesiones para analisis posterior de funnel.
 *
 * Filtros:
 *  - duracion >= 5s (rebotes no aportan).
 *  - identificador unique por sesion + minuto (evita duplicados si el
 *    disconnect llega dos veces — beforeunload + visibilitychange).
 */
class PersistirSesion
{
    public function execute(Visitante $v): ?VisitanteSesion
    {
        $finUnix  = time();
        $duracion = max(0, $finUnix - $v->iniciadoEn);

        // Skip rebotes
        if ($duracion < 5) return null;

        // Idempotencia: si ya existe una sesion para este visitante con
        // inicio dentro del mismo minuto, asumimos que es el mismo evento
        // (disconnect doble).
        $minutoInicio = (int) ($v->iniciadoEn / 60) * 60;
        $existe = VisitanteSesion::query()
            ->where('visitante_hash', $v->identificador)
            ->whereBetween('inicio', [
                Carbon::createFromTimestamp($minutoInicio),
                Carbon::createFromTimestamp($minutoInicio + 60),
            ])
            ->exists();

        if ($existe) return null;

        try {
            $productoId = $this->resolverProductoIdDesdePagina($v->paginaActual);

            return VisitanteSesion::create([
                'visitante_hash'    => $v->identificador,
                'pagina_entrada'    => $v->paginaEntrada,
                'pagina_salida'     => $v->paginaActual,
                'producto_id'       => $productoId,
                'origen'            => $v->origen,
                'utm_source'        => $v->utmSource,
                'utm_medium'        => $v->utmMedium,
                'utm_campaign'      => $v->utmCampaign,
                'utm_content'       => $v->utmContent,
                'utm_term'          => $v->utmTerm,
                'landing_path'      => $v->landingPath ?? $v->paginaEntrada,
                'dispositivo'       => $v->dispositivo,
                'ciudad'            => $v->ciudad,
                'pais'              => $v->pais,
                'recorrido'         => $v->recorrido,
                'seccion_final'     => $v->seccion,
                'duracion_segundos' => $duracion,
                'inicio'            => Carbon::createFromTimestamp($v->iniciadoEn),
                'fin'               => Carbon::createFromTimestamp($finUnix),
            ]);
        } catch (\Throwable $e) {
            Log::warning('PersistirSesion fallo', ['msg' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Si la pagina de salida es de un producto, intenta resolver el id
     * por slug para hacer queries de funnel mas faciles. Fallback: null.
     */
    private function resolverProductoIdDesdePagina(string $pagina): ?int
    {
        if (! preg_match('#^/productos/([^/?]+)#', $pagina, $m)) return null;

        $slug = $m[1];
        return Producto::query()->where('slug', $slug)->value('id');
    }
}
