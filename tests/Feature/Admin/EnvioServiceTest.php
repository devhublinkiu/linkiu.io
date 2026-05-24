<?php

namespace Tests\Feature\Admin;

use App\Models\ZonaEnvio;
use App\Services\EnvioService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests de EnvioService — cubre EF0.1:
 *  - Cálculo correcto por tipo_costo (gratis / costo_fijo / gratis_desde)
 *  - Comportamiento del umbral en gratis_desde
 *  - Normalización case-insensitive de nombres de ciudad
 *  - Retorno null cuando no hay cobertura (insumo del bloqueo anti-tampering)
 */
class EnvioServiceTest extends TestCase
{
    use RefreshDatabase;

    private EnvioService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(EnvioService::class);
    }

    public function test_ciudad_sin_cobertura_retorna_null(): void
    {
        $this->crearZona('Costa', 'costo_fijo', 8000, null, [['Atlántico', ['Barranquilla']]]);

        $this->assertNull($this->service->calcularCostoEnvio('Bogotá', 100000));
    }

    public function test_tipo_costo_gratis_retorna_cero(): void
    {
        $this->crearZona('Bogotá zone', 'gratis', null, null, [['Cundinamarca', ['Bogotá']]]);

        $this->assertSame(0, $this->service->calcularCostoEnvio('Bogotá', 100000));
    }

    public function test_tipo_costo_fijo_retorna_costo(): void
    {
        $this->crearZona('Bogotá zone', 'costo_fijo', 5000, null, [['Cundinamarca', ['Bogotá']]]);

        $this->assertSame(5000, $this->service->calcularCostoEnvio('Bogotá', 10000));
        $this->assertSame(5000, $this->service->calcularCostoEnvio('Bogotá', 10_000_000));
    }

    public function test_gratis_desde_cobra_si_subtotal_es_menor_al_umbral(): void
    {
        $this->crearZona('Bogotá zone', 'gratis_desde', 9900, 100000, [['Cundinamarca', ['Bogotá']]]);

        $this->assertSame(9900, $this->service->calcularCostoEnvio('Bogotá', 99999));
    }

    public function test_gratis_desde_es_gratis_si_subtotal_alcanza_umbral(): void
    {
        $this->crearZona('Bogotá zone', 'gratis_desde', 9900, 100000, [['Cundinamarca', ['Bogotá']]]);

        $this->assertSame(0, $this->service->calcularCostoEnvio('Bogotá', 100000));
        $this->assertSame(0, $this->service->calcularCostoEnvio('Bogotá', 500000));
    }

    public function test_comparacion_ciudad_es_case_insensitive(): void
    {
        $this->crearZona('Bogotá zone', 'costo_fijo', 5000, null, [['Cundinamarca', ['Bogotá']]]);

        $this->assertSame(5000, $this->service->calcularCostoEnvio('BOGOTÁ', 10000));
        $this->assertSame(5000, $this->service->calcularCostoEnvio('bogotá', 10000));
        $this->assertSame(5000, $this->service->calcularCostoEnvio('  Bogotá  ', 10000));
    }

    public function test_zona_inactiva_se_ignora(): void
    {
        ZonaEnvio::create([
            'nombre'        => 'Bogotá inactiva',
            'departamentos' => [['id' => 1, 'nombre' => 'Cundinamarca', 'ciudades' => [['id' => 11, 'nombre' => 'Bogotá']]]],
            'tipo_costo'    => 'costo_fijo',
            'costo'         => 5000,
            'activo'        => false,
            'orden'         => 0,
        ]);

        $this->assertNull($this->service->calcularCostoEnvio('Bogotá', 10000));
    }

    public function test_tiene_cobertura_retorna_true_solo_si_la_ciudad_esta_cubierta(): void
    {
        $this->crearZona('Bogotá zone', 'costo_fijo', 5000, null, [['Cundinamarca', ['Bogotá']]]);

        $this->assertTrue($this->service->tieneCobertura('Bogotá'));
        $this->assertFalse($this->service->tieneCobertura('Medellín'));
    }

    /**
     * Helper para sembrar zonas con la estructura JSON que usa el frontend.
     *
     * @param  array<int, array{0: string, 1: array<int, string>}>  $departamentos
     */
    private function crearZona(
        string $nombre,
        string $tipoCosto,
        ?int $costo,
        ?int $umbral,
        array $departamentos,
    ): ZonaEnvio {
        $dptosJson = [];
        foreach ($departamentos as $i => [$dptoNombre, $ciudades]) {
            $dptosJson[] = [
                'id'       => $i + 1,
                'nombre'   => $dptoNombre,
                'ciudades' => array_map(
                    fn ($c, $j) => ['id' => ($i + 1) * 100 + $j, 'nombre' => $c],
                    $ciudades,
                    array_keys($ciudades),
                ),
            ];
        }

        return ZonaEnvio::create([
            'nombre'        => $nombre,
            'departamentos' => $dptosJson,
            'tipo_costo'    => $tipoCosto,
            'costo'         => $costo,
            'umbral_gratis' => $umbral,
            'activo'        => true,
            'orden'         => 0,
        ]);
    }
}
