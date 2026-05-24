<?php

namespace Tests\Feature\Admin;

use App\Actions\Envio\StoreZonaEnvio;
use App\Actions\Envio\UpdateZonaEnvio;
use App\Models\ZonaEnvio;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests de coherencia tipo_costo ↔ costo ↔ umbral_gratis (EF1.2).
 *
 * Garantiza que las Actions nunca dejan la BD en estado inválido — defensa
 * profunda complementaria al FormRequest. Estas Actions también pueden ser
 * invocadas desde tinker/seeders sin pasar por el FormRequest.
 */
class ZonaEnvioCoherenciaTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────
    // tipo_costo='gratis' — costo y umbral siempre se anulan
    // ─────────────────────────────────────────────────────────────────

    public function test_store_gratis_anula_costo_y_umbral_aunque_se_envien(): void
    {
        $zona = app(StoreZonaEnvio::class)->handle($this->payload([
            'tipo_costo'    => 'gratis',
            'costo'         => 5000,       // basura — debe quedar null
            'umbral_gratis' => 100000,     // basura — debe quedar null
        ]));

        $this->assertNull($zona->costo);
        $this->assertNull($zona->umbral_gratis);
    }

    // ─────────────────────────────────────────────────────────────────
    // tipo_costo='costo_fijo' — costo requerido, umbral anulado
    // ─────────────────────────────────────────────────────────────────

    public function test_store_costo_fijo_bloquea_si_falta_costo(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Indica el costo del envío para el tipo "costo fijo"');

        app(StoreZonaEnvio::class)->handle($this->payload(['tipo_costo' => 'costo_fijo', 'costo' => null]));
    }

    public function test_store_costo_fijo_anula_umbral_aunque_se_envie(): void
    {
        $zona = app(StoreZonaEnvio::class)->handle($this->payload([
            'tipo_costo'    => 'costo_fijo',
            'costo'         => 5000,
            'umbral_gratis' => 100000,   // basura — debe quedar null
        ]));

        $this->assertSame(5000, $zona->costo);
        $this->assertNull($zona->umbral_gratis);
    }

    // ─────────────────────────────────────────────────────────────────
    // tipo_costo='gratis_desde' — costo Y umbral requeridos
    // ─────────────────────────────────────────────────────────────────

    public function test_store_gratis_desde_bloquea_si_falta_costo(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Indica el costo del envío para el tipo "gratis desde"');

        app(StoreZonaEnvio::class)->handle($this->payload([
            'tipo_costo' => 'gratis_desde', 'costo' => null, 'umbral_gratis' => 100000,
        ]));
    }

    public function test_store_gratis_desde_bloquea_si_falta_umbral(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('monto a partir del cual el envío es gratis');

        app(StoreZonaEnvio::class)->handle($this->payload([
            'tipo_costo' => 'gratis_desde', 'costo' => 5000, 'umbral_gratis' => null,
        ]));
    }

    public function test_store_gratis_desde_bloquea_si_umbral_es_cero(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('monto a partir del cual el envío es gratis');

        app(StoreZonaEnvio::class)->handle($this->payload([
            'tipo_costo' => 'gratis_desde', 'costo' => 5000, 'umbral_gratis' => 0,
        ]));
    }

    public function test_store_gratis_desde_pasa_con_costo_y_umbral_completos(): void
    {
        $zona = app(StoreZonaEnvio::class)->handle($this->payload([
            'tipo_costo'    => 'gratis_desde',
            'costo'         => 9900,
            'umbral_gratis' => 100000,
        ]));

        $this->assertSame(9900, $zona->costo);
        $this->assertSame(100000, $zona->umbral_gratis);
    }

    // ─────────────────────────────────────────────────────────────────
    // Update también valida (mismas reglas)
    // ─────────────────────────────────────────────────────────────────

    public function test_update_bloquea_si_cambia_a_gratis_desde_sin_umbral(): void
    {
        $zona = ZonaEnvio::create($this->payload(['tipo_costo' => 'costo_fijo', 'costo' => 5000]));

        $this->expectException(\InvalidArgumentException::class);

        app(UpdateZonaEnvio::class)->handle($zona, [
            ...$this->payload(),
            'tipo_costo'    => 'gratis_desde',
            'costo'         => 5000,
            'umbral_gratis' => null,
        ]);
    }

    public function test_update_a_gratis_limpia_costo_y_umbral_previos(): void
    {
        $zona = ZonaEnvio::create($this->payload([
            'tipo_costo'    => 'gratis_desde',
            'costo'         => 9900,
            'umbral_gratis' => 100000,
        ]));

        app(UpdateZonaEnvio::class)->handle($zona, [
            ...$this->payload(),
            'tipo_costo' => 'gratis',
        ]);

        $zona->refresh();
        $this->assertNull($zona->costo, 'Al cambiar a gratis, costo previo debe limpiarse');
        $this->assertNull($zona->umbral_gratis, 'Al cambiar a gratis, umbral previo debe limpiarse');
    }

    /**
     * Payload mínimo válido. Overrides para los campos que cada test prueba.
     */
    private function payload(array $overrides = []): array
    {
        return [
            'nombre'        => 'Test',
            'departamentos' => [[
                'id'       => 1,
                'nombre'   => 'Cundinamarca',
                'ciudades' => [['id' => 11, 'nombre' => 'Bogotá']],
            ]],
            'tipo_costo'    => 'costo_fijo',
            'costo'         => 5000,
            'umbral_gratis' => null,
            ...$overrides,
        ];
    }
}
