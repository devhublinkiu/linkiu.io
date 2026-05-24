<?php

namespace Tests\Feature\Admin;

use App\Actions\MetodosPago\ToggleMetodoPago;
use App\Actions\MetodosPago\UpdateMetodoPagoConfig;
use App\Models\Integracion;
use App\Models\MetodoPago;
use App\Models\User;
use App\Services\MercadoPagoService;
use Database\Seeders\MetodosPagoSeeder;
use Database\Seeders\PermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests críticos del módulo Métodos de Pago:
 *  - C1 (fix): mp_configurado usa MercadoPagoService::tieneCredenciales()
 *  - C2 (fix): instrucciones se sanitizan con strip_tags
 *  - M1 (fix): activación de métodos requiere coherencia de config
 */
class MetodosPagoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
        $this->seed(PermissionsSeeder::class);
        $this->seed(MetodosPagoSeeder::class);
    }

    // ─────────────────────────────────────────────────────────────────
    // C1 — Toggle MP requiere credenciales reales
    // ─────────────────────────────────────────────────────────────────

    public function test_toggle_mp_bloqueado_sin_credenciales(): void
    {
        $mp = MetodoPago::where('clave', 'mercadopago')->first();
        $action = app(ToggleMetodoPago::class);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Configura las credenciales de Mercado Pago');

        $action->handle($mp);
    }

    public function test_toggle_mp_pasa_con_credenciales_sandbox(): void
    {
        Integracion::set('mp_sandbox', '1');
        Integracion::set('mp_access_token_sandbox', 'APP_USR-TEST');

        $mp = MetodoPago::where('clave', 'mercadopago')->first();
        app(ToggleMetodoPago::class)->handle($mp);

        $this->assertTrue($mp->fresh()->activo);
    }

    public function test_index_reporta_mp_configurado_segun_credenciales_reales(): void
    {
        $admin = $this->crearSuperAdmin();

        // Sin credenciales
        $this->actingAs($admin)
            ->get(route('admin.metodos-pago.index'))
            ->assertInertia(fn ($page) => $page->where('mp_configurado', false));

        // Con credenciales sandbox
        Integracion::set('mp_sandbox', '1');
        Integracion::set('mp_access_token_sandbox', 'APP_USR-TEST');

        $this->actingAs($admin)
            ->get(route('admin.metodos-pago.index'))
            ->assertInertia(fn ($page) => $page->where('mp_configurado', true));
    }

    // ─────────────────────────────────────────────────────────────────
    // M1 — Coherencia de config al activar
    // ─────────────────────────────────────────────────────────────────

    public function test_toggle_transferencia_bloqueado_sin_datos_bancarios(): void
    {
        $transferencia = MetodoPago::where('clave', 'transferencia')->first();
        $action = app(ToggleMetodoPago::class);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Completa banco, número de cuenta y titular');

        $action->handle($transferencia);
    }

    public function test_toggle_transferencia_bloqueado_con_datos_parciales(): void
    {
        $transferencia = MetodoPago::where('clave', 'transferencia')->first();
        $transferencia->update(['config' => [
            'banco'         => 'Bancolombia',
            'numero_cuenta' => '12345',
            // falta 'titular'
        ]]);

        $this->expectException(\InvalidArgumentException::class);
        app(ToggleMetodoPago::class)->handle($transferencia);
    }

    public function test_toggle_transferencia_pasa_con_datos_completos(): void
    {
        $transferencia = MetodoPago::where('clave', 'transferencia')->first();
        $transferencia->update(['config' => [
            'banco'         => 'Bancolombia',
            'numero_cuenta' => '123-456789-00',
            'titular'       => 'Juan Pérez',
        ]]);

        app(ToggleMetodoPago::class)->handle($transferencia);

        $this->assertTrue($transferencia->fresh()->activo);
    }

    public function test_toggle_contraentrega_siempre_se_puede_activar(): void
    {
        $contraentrega = MetodoPago::where('clave', 'contraentrega')->first();
        app(ToggleMetodoPago::class)->handle($contraentrega);

        $this->assertTrue($contraentrega->fresh()->activo);
    }

    public function test_toggle_off_no_valida_coherencia(): void
    {
        // Apagar un método activo NUNCA debe validar — siempre se puede apagar
        $transferencia = MetodoPago::where('clave', 'transferencia')->first();
        $transferencia->update(['activo' => true, 'config' => null]);  // estado inválido pero existente

        app(ToggleMetodoPago::class)->handle($transferencia);

        $this->assertFalse($transferencia->fresh()->activo);
    }

    // ─────────────────────────────────────────────────────────────────
    // C2 — strip_tags en instrucciones
    // ─────────────────────────────────────────────────────────────────

    public function test_instrucciones_con_script_es_sanitizada(): void
    {
        $transferencia = MetodoPago::where('clave', 'transferencia')->first();
        app(UpdateMetodoPagoConfig::class)->handle($transferencia, [
            'instrucciones' => 'Pago normal<script>alert(1)</script> seguir',
        ]);

        $cfg = $transferencia->fresh()->config;
        $this->assertSame('Pago normal seguir', $cfg['instrucciones']);
    }

    public function test_instrucciones_con_html_tags_es_sanitizada(): void
    {
        $transferencia = MetodoPago::where('clave', 'transferencia')->first();
        app(UpdateMetodoPagoConfig::class)->handle($transferencia, [
            'instrucciones' => '<b>Importante:</b> envía al <a href="javascript:alert(1)">link</a>',
        ]);

        $cfg = $transferencia->fresh()->config;
        $this->assertSame('Importante: envía al link', $cfg['instrucciones']);
    }

    public function test_instrucciones_texto_plano_intacto(): void
    {
        $transferencia = MetodoPago::where('clave', 'transferencia')->first();
        app(UpdateMetodoPagoConfig::class)->handle($transferencia, [
            'instrucciones' => 'Pago al wa.me/3001234567 con código LNK',
        ]);

        $cfg = $transferencia->fresh()->config;
        $this->assertSame('Pago al wa.me/3001234567 con código LNK', $cfg['instrucciones']);
    }

    public function test_instrucciones_solo_html_resulta_en_null(): void
    {
        $transferencia = MetodoPago::where('clave', 'transferencia')->first();
        app(UpdateMetodoPagoConfig::class)->handle($transferencia, [
            'instrucciones' => '<script>alert(1)</script>',
        ]);

        $cfg = $transferencia->fresh()->config;
        $this->assertNull($cfg['instrucciones']);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function crearSuperAdmin(): User
    {
        $admin = User::factory()->create([
            'role'              => 'admin',
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('super-admin');
        return $admin;
    }
}
