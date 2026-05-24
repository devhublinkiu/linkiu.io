<?php

namespace Tests\Feature\Admin;

use App\Models\Client;
use App\Models\Order;
use App\Models\Producto;
use App\Services\DashboardStatsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Tests del agregador de stats del dashboard admin (DF1).
 *
 * Cubre decisiones de negocio del módulo:
 *  - pedidos_hoy: todos los estados, solo del día
 *  - ingresos_hoy: SUM(total) excluyendo pendiente/cancelado
 *  - clientes_total: count histórico
 *  - productos_activos: solo status='activo'
 *  - actividad_reciente: últimas 5 DESC
 *  - cache 60s evita 2do hit a la BD
 */
class DashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    private DashboardStatsService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->service = app(DashboardStatsService::class);
    }

    // ─────────────────────────────────────────────────────────────────
    // pedidos_hoy — TODOS los estados del día
    // ─────────────────────────────────────────────────────────────────

    public function test_pedidos_hoy_cuenta_todas_las_creadas_hoy_sin_importar_estado(): void
    {
        $cliente = $this->crearCliente();

        $this->crearOrden($cliente, ['estado' => 'pendiente']);
        $this->crearOrden($cliente, ['estado' => 'confirmado']);
        $this->crearOrden($cliente, ['estado' => 'cancelado']);
        $this->crearOrden($cliente, ['estado' => 'entregado']);

        $this->assertSame(4, $this->service->obtener()['pedidos_hoy']);
    }

    public function test_pedidos_hoy_excluye_ordenes_de_dias_anteriores(): void
    {
        $cliente = $this->crearCliente();

        $this->crearOrden($cliente, ['created_at' => Carbon::yesterday()]);
        $this->crearOrden($cliente, ['created_at' => Carbon::yesterday()->subDays(5)]);
        $this->crearOrden($cliente);  // hoy

        $this->assertSame(1, $this->service->obtener()['pedidos_hoy']);
    }

    // ─────────────────────────────────────────────────────────────────
    // ingresos_hoy — solo estados que generan ingreso real
    // ─────────────────────────────────────────────────────────────────

    public function test_ingresos_hoy_suma_total_solo_de_estados_de_ingreso(): void
    {
        $cliente = $this->crearCliente();

        // ESTOS sí cuentan (estados de ingreso real)
        $this->crearOrden($cliente, ['estado' => 'confirmado', 'total' => 10000]);
        $this->crearOrden($cliente, ['estado' => 'preparando',  'total' => 20000]);
        $this->crearOrden($cliente, ['estado' => 'enviado',     'total' => 30000]);
        $this->crearOrden($cliente, ['estado' => 'entregado',   'total' => 40000]);

        // Estos NO deben sumar
        $this->crearOrden($cliente, ['estado' => 'pendiente',  'total' => 99999]);
        $this->crearOrden($cliente, ['estado' => 'cancelado',  'total' => 99999]);

        $this->assertSame(100000, $this->service->obtener()['ingresos_hoy']);
    }

    public function test_ingresos_hoy_es_cero_sin_ordenes(): void
    {
        $this->assertSame(0, $this->service->obtener()['ingresos_hoy']);
    }

    public function test_ingresos_hoy_excluye_ordenes_de_dias_anteriores_aunque_sean_confirmadas(): void
    {
        $cliente = $this->crearCliente();
        $this->crearOrden($cliente, ['estado' => 'confirmado', 'total' => 50000, 'created_at' => Carbon::yesterday()]);

        $this->assertSame(0, $this->service->obtener()['ingresos_hoy']);
    }

    // ─────────────────────────────────────────────────────────────────
    // clientes_total + productos_activos
    // ─────────────────────────────────────────────────────────────────

    public function test_clientes_total_es_count_historico(): void
    {
        $this->crearCliente(['created_at' => Carbon::now()->subYear()]);
        $this->crearCliente(['created_at' => Carbon::yesterday()]);
        $this->crearCliente();  // hoy

        $this->assertSame(3, $this->service->obtener()['clientes_total']);
    }

    public function test_productos_activos_excluye_los_borradores(): void
    {
        // El enum productos.status acepta solo 'borrador' o 'activo'.
        $this->crearProducto(['status' => 'activo']);
        $this->crearProducto(['status' => 'activo']);
        $this->crearProducto(['status' => 'borrador']);

        $this->assertSame(2, $this->service->obtener()['productos_activos']);
    }

    // ─────────────────────────────────────────────────────────────────
    // actividad_reciente — últimas 5 DESC, con info mínima
    // ─────────────────────────────────────────────────────────────────

    public function test_actividad_reciente_retorna_las_ultimas_5_orden_desc(): void
    {
        $cliente = $this->crearCliente();

        // Crear 7 órdenes con timestamps escalonados
        for ($i = 0; $i < 7; $i++) {
            $this->crearOrden($cliente, ['created_at' => Carbon::now()->subMinutes(7 - $i)]);
        }

        $actividad = $this->service->obtener()['actividad_reciente'];

        $this->assertCount(5, $actividad);
        // Más reciente primero
        $this->assertTrue(
            $actividad[0]['created_at'] > $actividad[4]['created_at'],
            'actividad_reciente debe estar ordenada DESC por created_at',
        );

        // Shape de cada item
        $primera = $actividad[0];
        $this->assertArrayHasKey('id',         $primera);
        $this->assertArrayHasKey('codigo',     $primera);
        $this->assertArrayHasKey('total',      $primera);
        $this->assertArrayHasKey('estado',     $primera);
        $this->assertArrayHasKey('created_at', $primera);
        $this->assertMatchesRegularExpression('/^LNK-\d{6}$/', $primera['codigo']);
    }

    // ─────────────────────────────────────────────────────────────────
    // Cache 60s — segundo hit no rehace queries
    // ─────────────────────────────────────────────────────────────────

    public function test_cache_evita_segundo_hit_a_la_bd(): void
    {
        $cliente = $this->crearCliente();
        $this->crearOrden($cliente, ['estado' => 'confirmado', 'total' => 50000]);

        // Primer hit — cachea
        $primero = $this->service->obtener();
        $this->assertSame(50000, $primero['ingresos_hoy']);

        // Creamos una orden NUEVA después del cache → el segundo hit debe
        // devolver el valor cacheado (sin la nueva orden)
        $this->crearOrden($cliente, ['estado' => 'confirmado', 'total' => 999999]);

        $segundo = $this->service->obtener();
        $this->assertSame(50000, $segundo['ingresos_hoy'], 'Cache debe devolver el valor previo, no recalcular');
    }

    public function test_olvidar_invalida_el_cache(): void
    {
        $cliente = $this->crearCliente();
        $this->crearOrden($cliente, ['estado' => 'confirmado', 'total' => 50000]);

        $this->service->obtener();

        // Cache invalidada → siguiente hit ve la nueva orden
        $this->service->olvidar();
        $this->crearOrden($cliente, ['estado' => 'confirmado', 'total' => 10000]);

        $this->assertSame(60000, $this->service->obtener()['ingresos_hoy']);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function crearCliente(array $overrides = []): Client
    {
        static $contador = 0;
        $contador++;

        return Client::create(array_merge([
            'nombre'   => 'Test',
            'apellido' => 'Cliente' . $contador,
            'email'    => "cliente{$contador}@test.com",
            'telefono' => '3001234567',
        ], $overrides));
    }

    private function crearOrden(Client $cliente, array $overrides = []): Order
    {
        $orden = Order::create(array_merge([
            'client_id'    => $cliente->id,
            'estado'       => 'pendiente',
            'metodo_pago'  => 'contraentrega',
            'subtotal'     => 10000,
            'costo_envio'  => 0,
            'recargo'      => 0,
            'total'        => 10000,
            'nombre'       => $cliente->nombre,
            'apellido'     => $cliente->apellido,
            'email'        => $cliente->email,
            'telefono'     => $cliente->telefono,
            'departamento' => 'Cundinamarca',
            'ciudad'       => 'Bogotá',
            'direccion'    => 'Cl 100',
        ], $overrides));

        // Si el caller pasó created_at, forzarlo (el observer no lo respeta en create)
        if (isset($overrides['created_at'])) {
            $orden->created_at = $overrides['created_at'];
            $orden->save();
        }

        return $orden;
    }

    private function crearProducto(array $overrides = []): Producto
    {
        static $contador = 0;
        $contador++;

        return Producto::create(array_merge([
            'nombre'      => "Producto {$contador}",
            'slug'        => "producto-{$contador}",
            'sku'         => "SKU-{$contador}",
            'unidad'      => 'unidad',
            'status'      => 'activo',
            'precio_base' => 10000,
        ], $overrides));
    }
}
