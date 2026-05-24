<?php

namespace App\Actions\Envio;

use App\Models\ZonaEnvio;

class UpdateZonaEnvio
{
    /**
     * Actualiza una zona de envío. Aplica el mismo set de reglas de coherencia
     * que StoreZonaEnvio para garantizar que ningún update deje la BD en
     * estado inválido (p.ej. tipo_costo='gratis_desde' sin umbral).
     *
     * @throws \InvalidArgumentException si los datos son incoherentes.
     */
    public function handle(ZonaEnvio $zona, array $data): void
    {
        $data = $this->normalizarCoherencia($data);

        $zona->update($data);
    }

    private function normalizarCoherencia(array $data): array
    {
        return match ($data['tipo_costo']) {
            'gratis'       => [...$data, 'costo' => null, 'umbral_gratis' => null],
            'costo_fijo'   => $this->validarCostoFijo($data),
            'gratis_desde' => $this->validarGratisDesde($data),
            default        => throw new \InvalidArgumentException('Tipo de costo inválido.'),
        };
    }

    private function validarCostoFijo(array $data): array
    {
        if (! isset($data['costo']) || $data['costo'] === null) {
            throw new \InvalidArgumentException('Indica el costo del envío para el tipo "costo fijo".');
        }

        return [...$data, 'umbral_gratis' => null];
    }

    private function validarGratisDesde(array $data): array
    {
        if (! isset($data['costo']) || $data['costo'] === null) {
            throw new \InvalidArgumentException('Indica el costo del envío para el tipo "gratis desde".');
        }

        if (! isset($data['umbral_gratis']) || $data['umbral_gratis'] === null || $data['umbral_gratis'] < 1) {
            throw new \InvalidArgumentException('Indica el monto a partir del cual el envío es gratis.');
        }

        return $data;
    }
}
