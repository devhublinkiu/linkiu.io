<?php

namespace App\Actions\Envio;

use App\Models\ZonaEnvio;

class StoreZonaEnvio
{
    /**
     * Crea una zona de envío. Normaliza coherencia tipo_costo ↔ costo ↔ umbral
     * para que la BD nunca tenga estados inválidos (defensa redundante con el
     * FormRequest — esta Action puede ser llamada desde tinker/seeders).
     *
     * @throws \InvalidArgumentException si los datos son incoherentes.
     */
    public function handle(array $data): ZonaEnvio
    {
        $data = $this->normalizarCoherencia($data);

        return ZonaEnvio::create($data);
    }

    /**
     * Aplica las reglas de coherencia:
     *  - 'gratis'       → costo=null, umbral_gratis=null (siempre 0).
     *  - 'costo_fijo'   → costo requerido, umbral_gratis=null.
     *  - 'gratis_desde' → costo y umbral_gratis ambos requeridos.
     */
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
