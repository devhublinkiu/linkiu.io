<?php

namespace App\Services;

use App\Models\ZonaEnvio;

/**
 * Cálculo autoritativo del costo de envío.
 *
 * IMPORTANTE — Es la ÚNICA fuente de verdad para el costo de envío.
 * Frontend puede mostrar un cálculo informativo en checkout, pero CrearOrden
 * SIEMPRE recalcula con este service e ignora el campo `costo_envio` del
 * payload del cliente (prevención de tampering: cliente no puede mandar
 * `costo_envio=0` para evadir el cobro real).
 *
 * Reglas por tipo_costo:
 *  - 'gratis'        → siempre 0
 *  - 'costo_fijo'    → siempre el costo configurado
 *  - 'gratis_desde'  → 0 si subtotal >= umbral_gratis, costo configurado si no
 *
 * Si la ciudad no está en ninguna zona activa, retorna null (sin cobertura).
 */
class EnvioService
{
    /**
     * Calcula el costo de envío para una ciudad y subtotal dados.
     *
     * @return int|null  Costo en pesos. null si la ciudad no tiene cobertura.
     */
    public function calcularCostoEnvio(string $ciudad, int $subtotal): ?int
    {
        $zona = $this->buscarZonaPorCiudad($ciudad);

        if (! $zona) {
            return null;
        }

        return match ($zona->tipo_costo) {
            'gratis'       => 0,
            'gratis_desde' => $subtotal >= ($zona->umbral_gratis ?? PHP_INT_MAX) ? 0 : ($zona->costo ?? 0),
            'costo_fijo'   => $zona->costo ?? 0,
            default        => $zona->costo ?? 0,
        };
    }

    /**
     * Verifica si una ciudad tiene cobertura de envío.
     */
    public function tieneCobertura(string $ciudad): bool
    {
        return $this->buscarZonaPorCiudad($ciudad) !== null;
    }

    /**
     * Busca la primera zona activa que contenga la ciudad en su árbol de
     * departamentos. Comparación case-insensitive con normalización de espacios
     * para tolerar diferencias entre el snapshot del admin y el dato del cliente.
     */
    private function buscarZonaPorCiudad(string $ciudad): ?ZonaEnvio
    {
        $ciudadNormalizada = $this->normalizar($ciudad);

        $zonas = ZonaEnvio::where('activo', true)
            ->orderBy('orden')
            ->orderBy('id')
            ->get();

        foreach ($zonas as $zona) {
            foreach ($zona->departamentos ?? [] as $dpto) {
                foreach ($dpto['ciudades'] ?? [] as $c) {
                    if ($this->normalizar($c['nombre'] ?? '') === $ciudadNormalizada) {
                        return $zona;
                    }
                }
            }
        }

        return null;
    }

    private function normalizar(string $texto): string
    {
        return mb_strtolower(trim(preg_replace('/\s+/', ' ', $texto) ?? ''));
    }
}
