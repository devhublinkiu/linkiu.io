<?php

namespace Tests\Feature\Admin;

use App\Services\ColombiaDataService;
use Database\Seeders\PermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests del proxy cacheado a api-colombia.com (EF2).
 *
 * Cubre:
 *  - Cache hit: segunda llamada NO hace request externo
 *  - Normalización: shape consistente {departamentos, ciudades}
 *  - Fallback: 503 si la API externa cae
 *  - Permisos: solo can:envio.editar accede al endpoint
 */
class ColombiaDataServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();   // siempre arrancamos sin cache de runs anteriores
    }

    // ─────────────────────────────────────────────────────────────────
    // Service: cache + normalización + fallback
    // ─────────────────────────────────────────────────────────────────

    public function test_cache_hit_evita_segundo_request_externo(): void
    {
        Http::fake([
            'api-colombia.com/api/v1/Department' => Http::response($this->fakeDepartamentos(), 200),
            'api-colombia.com/api/v1/City'       => Http::response($this->fakeCiudades(),      200),
        ]);

        $service = app(ColombiaDataService::class);

        $service->obtener();  // primer hit — golpea la API
        $service->obtener();  // segundo hit — debe venir del cache
        $service->obtener();  // tercero también

        // Solo 2 requests totales (1 por endpoint), NO 6
        Http::assertSentCount(2);
    }

    public function test_service_normaliza_shape_para_el_frontend(): void
    {
        Http::fake([
            'api-colombia.com/api/v1/Department' => Http::response($this->fakeDepartamentos(), 200),
            'api-colombia.com/api/v1/City'       => Http::response($this->fakeCiudades(),      200),
        ]);

        $data = app(ColombiaDataService::class)->obtener();

        $this->assertArrayHasKey('departamentos', $data);
        $this->assertArrayHasKey('ciudades',      $data);

        $this->assertSame(
            [['id' => 1, 'name' => 'Cundinamarca'], ['id' => 2, 'name' => 'Antioquia']],
            $data['departamentos'],
        );

        $this->assertSame(
            ['id' => 11, 'name' => 'Bogotá', 'departmentId' => 1],
            $data['ciudades'][0],
        );
    }

    public function test_service_lanza_runtime_exception_si_api_externa_falla(): void
    {
        Http::fake([
            'api-colombia.com/*' => Http::response('Service Unavailable', 503),
        ]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('No se pudo obtener la lista de departamentos y ciudades.');

        app(ColombiaDataService::class)->obtener();
    }

    public function test_refrescar_invalida_el_cache_y_vuelve_a_pegar_externo(): void
    {
        Http::fake([
            'api-colombia.com/api/v1/Department' => Http::response($this->fakeDepartamentos(), 200),
            'api-colombia.com/api/v1/City'       => Http::response($this->fakeCiudades(),      200),
        ]);

        $service = app(ColombiaDataService::class);
        $service->obtener();
        $service->refrescar();  // forzar segundo hit

        Http::assertSentCount(4);  // 2 por cada obtener()
    }

    // ─────────────────────────────────────────────────────────────────
    // Endpoint: permisos + integración con el service
    // ─────────────────────────────────────────────────────────────────

    public function test_endpoint_retorna_503_si_api_externa_cae(): void
    {
        Http::fake(['api-colombia.com/*' => Http::response('', 500)]);

        $admin = $this->crearAdminConPermisos();

        $this->actingAs($admin)
            ->getJson(route('admin.envio.colombia-data'))
            ->assertStatus(503)
            ->assertJsonFragment(['error' => 'No se pudo cargar la lista de departamentos y ciudades. Intenta en unos minutos.']);
    }

    public function test_endpoint_bloquea_a_usuarios_sin_permiso_envio_editar(): void
    {
        $admin = \App\Models\User::factory()->create(['role' => 'admin', 'email_verified_at' => now()]);
        // Sin role asignado → sin permisos

        $this->actingAs($admin)
            ->getJson(route('admin.envio.colombia-data'))
            ->assertStatus(403);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function crearAdminConPermisos(): \App\Models\User
    {
        Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $this->seed(PermissionsSeeder::class);

        $admin = \App\Models\User::factory()->create([
            'role'              => 'admin',
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('super-admin');
        return $admin;
    }

    private function fakeDepartamentos(): array
    {
        return [
            ['id' => 1, 'name' => 'Cundinamarca', 'description' => 'desc ignorada'],
            ['id' => 2, 'name' => 'Antioquia',    'description' => 'desc ignorada'],
        ];
    }

    private function fakeCiudades(): array
    {
        return [
            ['id' => 11, 'name' => 'Bogotá',    'departmentId' => 1, 'population' => 'ignored'],
            ['id' => 12, 'name' => 'Medellín',  'departmentId' => 2, 'population' => 'ignored'],
        ];
    }
}
