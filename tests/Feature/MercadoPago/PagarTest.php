<?php

namespace Tests\Feature\MercadoPago;

use App\Jobs\NotificarOrdenCreada;
use App\Models\Integracion;
use App\Models\Order;
use App\Models\ZonaEnvio;
use App\Services\MercadoPagoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\RateLimiter;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

/**
 * Cubre los puntos críticos del flow MercadoPago:
 *  - PF0.1 Webhook fail-closed sin firma
 *  - PF0.2 Idempotencia (mp_notificado_at)
 *  - PF0.3 Rate limit 10/min
 *  - PF1   Uso de CrearOrden action
 *  - PF3.1 tieneCredenciales() → 422 user-friendly
 */
class PagarTest extends TestCase
{
    use RefreshDatabase;

    private MercadoPagoService|MockInterface $mp;

    protected function setUp(): void
    {
        parent::setUp();
        Bus::fake();

        $this->mp = Mockery::mock(MercadoPagoService::class);
        $this->mp->shouldReceive('tieneCredenciales')->andReturn(true)->byDefault();
        $this->app->instance(MercadoPagoService::class, $this->mp);

        // Webhook secret para que verificarWebhook pase cuando lo necesitemos
        Integracion::set('mp_webhook_secret', 'test-secret-xyz');

        // EnvioService valida cobertura en MP::pagar. Sembramos zona que
        // cubre Bogotá con costo 5000 para que el payloadValido() coincida.
        ZonaEnvio::create([
            'nombre'        => 'Bogotá',
            'departamentos' => [[
                'id'       => 1,
                'nombre'   => 'Cundinamarca',
                'ciudades' => [['id' => 11, 'nombre' => 'Bogotá']],
            ]],
            'tipo_costo'    => 'costo_fijo',
            'costo'         => 5000,
            'activo'        => true,
            'orden'         => 0,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    // POST /api/mp/pagar
    // ─────────────────────────────────────────────────────────────────

    public function test_pagar_happy_path_approved_crea_orden_y_dispatcha_notificacion(): void
    {
        $this->mp->shouldReceive('crearPago')->once()->andReturn([
            'id'                    => 12345,
            'status'                => 'approved',
            'status_detail'         => 'accredited',
            'external_resource_url' => null,
            'three_ds_info'         => null,
        ]);

        $response = $this->postJson('/api/mp/pagar', $this->payloadValido());

        $response->assertStatus(200);
        $response->assertJson([
            'status'        => 'approved',
            'status_detail' => 'accredited',
            'payment_id'    => 12345,
        ]);

        $this->assertDatabaseHas('orders', [
            'email'         => 'happy@test.com',
            'mp_payment_id' => '12345',
            'mp_status'     => 'approved',
            'estado'        => 'confirmado',
        ]);

        $orden = Order::where('email', 'happy@test.com')->first();
        $this->assertNotNull($orden->mp_notificado_at, 'approved debe setear mp_notificado_at');
        $this->assertMatchesRegularExpression('/^LNK-\d{6}$/', $orden->codigo);

        Bus::assertDispatched(NotificarOrdenCreada::class, fn ($job) => $job->orden->id === $orden->id);
    }

    public function test_pagar_rechazado_devuelve_422_y_no_crea_orden(): void
    {
        $this->mp->shouldReceive('crearPago')->once()->andReturn([
            'id'                    => 99999,
            'status'                => 'rejected',
            'status_detail'         => 'cc_rejected_insufficient_amount',
            'external_resource_url' => null,
            'three_ds_info'         => null,
        ]);

        $response = $this->postJson('/api/mp/pagar', $this->payloadValido(['email' => 'rejected@test.com']));

        $response->assertStatus(422);
        $response->assertJsonFragment(['error' => 'Fondos insuficientes. Intenta con otra tarjeta.']);

        $this->assertDatabaseMissing('orders', ['email' => 'rejected@test.com']);
        Bus::assertNothingDispatched();
    }

    public function test_pagar_pending_crea_orden_pero_no_notifica_al_cliente(): void
    {
        $this->mp->shouldReceive('crearPago')->once()->andReturn([
            'id'                    => 55555,
            'status'                => 'pending',
            'status_detail'         => 'pending_waiting_transfer',
            'external_resource_url' => null,
            'three_ds_info'         => null,
        ]);

        $this->postJson('/api/mp/pagar', $this->payloadValido(['email' => 'pending@test.com']))
            ->assertStatus(200)
            ->assertJson(['status' => 'pending']);

        $orden = Order::where('email', 'pending@test.com')->first();
        $this->assertSame('pendiente', $orden->estado);
        $this->assertNull($orden->mp_notificado_at, 'pending NO debe setear mp_notificado_at');

        Bus::assertNotDispatched(NotificarOrdenCreada::class);
    }

    public function test_pagar_sin_credenciales_devuelve_422_user_friendly(): void
    {
        $this->mp = Mockery::mock(MercadoPagoService::class);
        $this->mp->shouldReceive('tieneCredenciales')->andReturn(false);
        $this->mp->shouldNotReceive('crearPago');
        $this->app->instance(MercadoPagoService::class, $this->mp);

        $this->postJson('/api/mp/pagar', $this->payloadValido(['email' => 'no-cred@test.com']))
            ->assertStatus(422)
            ->assertJsonFragment(['error' => 'La pasarela de pago no está disponible en este momento. Por favor, contacta al soporte de la tienda.']);

        $this->assertDatabaseMissing('orders', ['email' => 'no-cred@test.com']);
    }

    public function test_pagar_rate_limit_429_despues_de_10_intentos(): void
    {
        $this->mp->shouldReceive('crearPago')->andReturn([
            'id' => 1, 'status' => 'rejected', 'status_detail' => 'cc_rejected_blacklist',
            'external_resource_url' => null, 'three_ds_info' => null,
        ]);

        $email = 'rate-' . uniqid() . '@test.com';
        $payload = $this->payloadValido(['email' => $email]);

        // 10 requests deben pasar (todos rejected pero el throttle no bloquea aún)
        for ($i = 1; $i <= 10; $i++) {
            $this->postJson('/api/mp/pagar', $payload)->assertStatus(422);
        }

        // El 11º request debe ser bloqueado por el throttle
        $this->postJson('/api/mp/pagar', $payload)->assertStatus(429);
    }

    // ─────────────────────────────────────────────────────────────────
    // POST /webhooks/mercadopago
    // ─────────────────────────────────────────────────────────────────

    public function test_webhook_sin_firma_devuelve_401(): void
    {
        // El service real lo deja Mockery hacer fall-through al verificarWebhook
        // (no mockeamos esa expectativa). Si MP no envía firma, debe rechazar.
        $this->mp->shouldReceive('verificarWebhook')->with('', '', Mockery::any())->andReturn(false);

        $this->postJson('/webhooks/mercadopago', ['type' => 'payment', 'data' => ['id' => 999]])
            ->assertStatus(401)
            ->assertJson(['ok' => false]);
    }

    public function test_webhook_con_firma_invalida_devuelve_401(): void
    {
        $this->mp->shouldReceive('verificarWebhook')->andReturn(false);

        $this->postJson(
            '/webhooks/mercadopago',
            ['type' => 'payment', 'data' => ['id' => 999]],
            ['x-signature' => 'ts=123,v1=invalid'],
        )->assertStatus(401);
    }

    public function test_webhook_approved_marca_orden_y_dispatcha_una_sola_vez(): void
    {
        $orden = $this->crearOrdenMP('webhook-1@test.com', '88888');
        $this->mp->shouldReceive('verificarWebhook')->andReturn(true);
        $this->mp->shouldReceive('consultarPago')->with('88888')->andReturn([
            'id' => 88888, 'status' => 'approved', 'status_detail' => 'accredited',
        ]);

        $this->postJson(
            '/webhooks/mercadopago',
            ['type' => 'payment', 'data' => ['id' => '88888']],
            ['x-signature' => 'ts=123,v1=hash'],
        )->assertStatus(200);

        $orden->refresh();
        $this->assertSame('confirmado', $orden->estado);
        $this->assertNotNull($orden->mp_notificado_at);
        Bus::assertDispatchedTimes(NotificarOrdenCreada::class, 1);
    }

    public function test_webhook_duplicado_no_redispatcha_notificacion(): void
    {
        $orden = $this->crearOrdenMP('webhook-dup@test.com', '77777', notificado: true);
        $this->mp->shouldReceive('verificarWebhook')->andReturn(true);
        $this->mp->shouldReceive('consultarPago')->with('77777')->andReturn([
            'id' => 77777, 'status' => 'approved', 'status_detail' => 'accredited',
        ]);

        // Webhook reenviado (simulación de MP que reintenta)
        $this->postJson(
            '/webhooks/mercadopago',
            ['type' => 'payment', 'data' => ['id' => '77777']],
            ['x-signature' => 'ts=123,v1=hash'],
        )->assertStatus(200);

        Bus::assertNotDispatched(NotificarOrdenCreada::class);
    }

    public function test_webhook_rejected_cancela_orden_sin_notificar(): void
    {
        $orden = $this->crearOrdenMP('webhook-rej@test.com', '66666');
        $this->mp->shouldReceive('verificarWebhook')->andReturn(true);
        $this->mp->shouldReceive('consultarPago')->andReturn([
            'id' => 66666, 'status' => 'rejected', 'status_detail' => 'cc_rejected_blacklist',
        ]);

        $this->postJson(
            '/webhooks/mercadopago',
            ['type' => 'payment', 'data' => ['id' => '66666']],
            ['x-signature' => 'ts=123,v1=hash'],
        )->assertStatus(200);

        $orden->refresh();
        $this->assertSame('cancelado', $orden->estado);
        $this->assertNull($orden->mp_notificado_at);
        Bus::assertNotDispatched(NotificarOrdenCreada::class);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function payloadValido(array $overrides = []): array
    {
        $email = $overrides['email'] ?? 'happy@test.com';
        return [
            'form_data' => [
                'transaction_amount' => 55000,
                'payment_method_id'  => 'visa',
                'token'              => 'TEST-TOKEN',
                'installments'       => 1,
                'issuer_id'          => '1',
                'payer'              => ['email' => $email],
            ],
            'order' => [
                'nombre'       => 'Test',
                'apellido'     => 'User',
                'email'        => $email,
                'telefono'     => '3001234567',
                'departamento' => 'Cundinamarca',
                'ciudad'       => 'Bogotá',
                'direccion'    => 'Cl 100 #15-20',
                'subtotal'     => 50000,
                'costo_envio'  => 5000,
                'recargo'      => 0,
                'total'        => 55000,
                'items'        => [
                    [
                        'nombre'      => 'Producto Test',
                        'cantidad'    => 1,
                        'precio'      => 50000,
                        'producto_id' => null,  // nullable según el endpoint
                    ],
                ],
            ],
        ];
    }

    private function crearOrdenMP(string $email, string $mpPaymentId, bool $notificado = false): Order
    {
        $cliente = \App\Models\Client::create([
            'nombre' => 'X', 'apellido' => 'Y', 'email' => $email, 'telefono' => '300',
        ]);

        return Order::create([
            'client_id'        => $cliente->id,
            'estado'           => 'pendiente',
            'metodo_pago'      => 'mercadopago',
            'mp_payment_id'    => $mpPaymentId,
            'mp_status'        => 'pending',
            'mp_status_detail' => 'pending',
            'mp_notificado_at' => $notificado ? now() : null,
            'subtotal'         => 50000,
            'total'            => 55000,
            'nombre'           => 'X',
            'apellido'         => 'Y',
            'email'            => $email,
            'telefono'         => '300',
            'departamento'     => 'd',
            'ciudad'           => 'c',
            'direccion'        => 'a',
        ]);
    }
}
