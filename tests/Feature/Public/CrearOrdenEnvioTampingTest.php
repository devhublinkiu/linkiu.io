<?php

namespace Tests\Feature\Public;

use App\Jobs\NotificarOrdenCreada;
use App\Models\Integracion;
use App\Models\Order;
use App\Models\ZonaEnvio;
use App\Services\MercadoPagoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

/**
 * Tests de defensa anti-tampering del costo de envío (EF0).
 *
 * Cubre los dos puntos de entrada que crean órdenes:
 *  - POST /api/mp/pagar     → MercadoPagoController + CrearOrden
 *  - POST /checkout/orden   → OrderController + CrearOrden
 *
 * Garantiza que el cliente NO puede pagar menos de lo que realmente cuesta
 * el envío manipulando el payload desde la consola del navegador.
 */
class CrearOrdenEnvioTampingTest extends TestCase
{
    use RefreshDatabase;

    private MercadoPagoService|MockInterface $mp;

    protected function setUp(): void
    {
        parent::setUp();
        Bus::fake();

        // Zona Bogotá con costo real de 8.000
        ZonaEnvio::create([
            'nombre'        => 'Bogotá',
            'departamentos' => [[
                'id'       => 1,
                'nombre'   => 'Cundinamarca',
                'ciudades' => [['id' => 11, 'nombre' => 'Bogotá']],
            ]],
            'tipo_costo'    => 'costo_fijo',
            'costo'         => 8000,
            'activo'        => true,
            'orden'         => 0,
        ]);

        // Mock MP para tests que vayan por /api/mp/pagar
        $this->mp = Mockery::mock(MercadoPagoService::class);
        $this->mp->shouldReceive('tieneCredenciales')->andReturn(true)->byDefault();
        $this->app->instance(MercadoPagoService::class, $this->mp);
        Integracion::set('mp_webhook_secret', 'test-secret');
    }

    // ─────────────────────────────────────────────────────────────────
    // OrderController::store — flujo transferencia / contraentrega
    // ─────────────────────────────────────────────────────────────────

    public function test_orden_persiste_costo_envio_recalculado_e_ignora_el_del_cliente(): void
    {
        $response = $this->post(route('orden.store'), [
            'nombre' => 'Juan', 'apellido' => 'Pérez', 'email' => 'juan@test.com',
            'telefono' => '3001234567',
            'departamento' => 'Cundinamarca', 'ciudad' => 'Bogotá',
            'direccion' => 'Cl 100', 'metodo_pago' => 'contraentrega',
            'subtotal' => 50000,
            'recargo'  => 0,
            // Cliente intenta tampering: manda 0 esperando envío gratis
            'costo_envio' => 0,
            'total'       => 50000,
            'items' => [['nombre' => 'Producto', 'cantidad' => 1, 'precio' => 50000, 'producto_id' => null]],
        ]);

        $response->assertOk();

        $orden = Order::first();
        $this->assertNotNull($orden, 'La orden debería haberse creado');
        $this->assertSame(8000, $orden->costo_envio, 'Backend debe ignorar el 0 del cliente y cobrar el costo real');
        $this->assertSame(58000, $orden->total,       'Total recalculado = subtotal + costo_envio real');
    }

    public function test_orden_falla_si_ciudad_no_tiene_cobertura(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('cobertura de envío');

        $this->withoutExceptionHandling()->post(route('orden.store'), [
            'nombre' => 'Juan', 'apellido' => 'Pérez', 'email' => 'juan@test.com',
            'telefono' => '3001234567',
            'departamento' => 'Antioquia', 'ciudad' => 'Medellín',
            'direccion' => 'Cl 1', 'metodo_pago' => 'contraentrega',
            'subtotal' => 50000, 'recargo' => 0, 'costo_envio' => 0, 'total' => 50000,
            'items' => [['nombre' => 'P', 'cantidad' => 1, 'precio' => 50000, 'producto_id' => null]],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    // MercadoPagoController::pagar — bloquea ANTES de cobrar
    // ─────────────────────────────────────────────────────────────────

    public function test_mp_pagar_bloquea_si_transaction_amount_no_coincide_con_recalculo(): void
    {
        // Tampering: el cliente manda costo_envio=0, total=50000. El backend
        // recalcula y obtiene total=58000. MP NO debería ser invocado.
        $this->mp->shouldNotReceive('crearPago');

        $response = $this->postJson('/api/mp/pagar', [
            'form_data' => [
                'transaction_amount' => 50000,  // tampering: cliente intenta pagar menos
                'payment_method_id'  => 'visa',
                'token'              => 'TEST', 'installments' => 1, 'issuer_id' => '1',
                'payer'              => ['email' => 'fraude@test.com'],
            ],
            'order' => [
                'nombre' => 'F', 'apellido' => 'F', 'email' => 'fraude@test.com',
                'telefono' => '3001234567',
                'departamento' => 'Cundinamarca', 'ciudad' => 'Bogotá',
                'direccion' => 'Cl 100',
                'subtotal' => 50000, 'costo_envio' => 0, 'recargo' => 0, 'total' => 50000,
                'items' => [['nombre' => 'P', 'cantidad' => 1, 'precio' => 50000, 'producto_id' => null]],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['error' => 'El total del pedido cambió. Recarga la página y vuelve a intentar.']);
        $this->assertSame(0, Order::count(), 'No debe haberse creado ninguna orden');
        Bus::assertNotDispatched(NotificarOrdenCreada::class);
    }

    public function test_mp_pagar_bloquea_si_ciudad_no_tiene_cobertura(): void
    {
        $this->mp->shouldNotReceive('crearPago');

        $response = $this->postJson('/api/mp/pagar', [
            'form_data' => [
                'transaction_amount' => 50000,
                'payment_method_id'  => 'visa',
                'token'              => 'TEST', 'installments' => 1, 'issuer_id' => '1',
                'payer'              => ['email' => 'sin-cobertura@test.com'],
            ],
            'order' => [
                'nombre' => 'X', 'apellido' => 'X', 'email' => 'sin-cobertura@test.com',
                'telefono' => '3001234567',
                'departamento' => 'Antioquia', 'ciudad' => 'Medellín',
                'direccion' => 'Cl 1',
                'subtotal' => 50000, 'costo_envio' => 0, 'recargo' => 0, 'total' => 50000,
                'items' => [['nombre' => 'P', 'cantidad' => 1, 'precio' => 50000, 'producto_id' => null]],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['error' => 'La ciudad seleccionada no tiene cobertura de envío.']);
        $this->assertSame(0, Order::count());
    }
}
