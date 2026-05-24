<?php

namespace Tests\Feature\Admin;

use App\Actions\Perfil\UpdateDatosPersonales;
use App\Models\User;
use Database\Seeders\PermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests críticos del módulo Perfil (admin):
 *  C1 — Cobertura del flujo (sin tests previos)
 *  C2 — Cambio de password invalida otras sesiones (Auth::logoutOtherDevices)
 *  C3 — Throttle perfil-update 10/min bloquea bruteforce de password_actual
 *  M1/M2 — Validación migrada a FormRequest con current_password rule
 */
class PerfilTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD_ACTUAL = 'PasswordActual123!';

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('perfil-update');

        Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
        Role::create(['name' => 'admin',       'guard_name' => 'web']);
        $this->seed(PermissionsSeeder::class);
    }

    // ─────────────────────────────────────────────────────────────────
    // Permisos y auth
    // ─────────────────────────────────────────────────────────────────

    public function test_sin_auth_redirect_al_login(): void
    {
        $this->post(route('admin.perfil.personal'), ['name' => 'X'])
            ->assertRedirect();
    }

    public function test_admin_sin_permiso_recibe_403(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'email_verified_at' => now()]);
        // Sin role asignado → sin permiso perfil.editar

        $this->actingAs($admin)
            ->post(route('admin.perfil.personal'), ['name' => 'X'])
            ->assertStatus(403);
    }

    // ─────────────────────────────────────────────────────────────────
    // M1 — Validación migrada a FormRequest
    // ─────────────────────────────────────────────────────────────────

    public function test_name_es_requerido(): void
    {
        $admin = $this->crearAdminConPassword();

        $this->actingAs($admin)
            ->from(route('admin.perfil'))
            ->post(route('admin.perfil.personal'), ['name' => ''])
            ->assertSessionHasErrors('name')
            ->assertRedirect(route('admin.perfil'));
    }

    public function test_solo_nombre_se_puede_actualizar_sin_password_actual(): void
    {
        $admin = $this->crearAdminConPassword();
        $hashOriginal = $admin->password;

        $this->actingAs($admin)
            ->post(route('admin.perfil.personal'), ['name' => 'Nuevo Nombre'])
            ->assertSessionHasNoErrors();

        $admin->refresh();
        $this->assertSame('Nuevo Nombre', $admin->name);
        $this->assertSame($hashOriginal, $admin->password, 'Sin password en payload, hash no debe cambiar');
    }

    public function test_password_requiere_password_actual(): void
    {
        $admin = $this->crearAdminConPassword();

        $this->actingAs($admin)
            ->from(route('admin.perfil'))
            ->post(route('admin.perfil.personal'), [
                'name'                  => $admin->name,
                'password'              => 'NuevaPass456!',
                'password_confirmation' => 'NuevaPass456!',
                // password_actual ausente
            ])
            ->assertSessionHasErrors('password_actual');
    }

    public function test_password_actual_incorrecta_es_rechazada(): void
    {
        $admin = $this->crearAdminConPassword();

        $this->actingAs($admin)
            ->from(route('admin.perfil'))
            ->post(route('admin.perfil.personal'), [
                'name'                  => $admin->name,
                'password_actual'       => 'CualquierCosaIncorrecta',
                'password'              => 'NuevaPass456!',
                'password_confirmation' => 'NuevaPass456!',
            ])
            ->assertSessionHasErrors('password_actual');

        // Hash NO debe haber cambiado
        $this->assertTrue(Hash::check(self::PASSWORD_ACTUAL, $admin->fresh()->password));
    }

    public function test_password_confirmation_debe_coincidir(): void
    {
        $admin = $this->crearAdminConPassword();

        $this->actingAs($admin)
            ->from(route('admin.perfil'))
            ->post(route('admin.perfil.personal'), [
                'name'                  => $admin->name,
                'password_actual'       => self::PASSWORD_ACTUAL,
                'password'              => 'NuevaPass456!',
                'password_confirmation' => 'OtraCosa',
            ])
            ->assertSessionHasErrors('password');
    }

    public function test_email_no_se_puede_cambiar_via_payload(): void
    {
        $admin = $this->crearAdminConPassword();
        $emailOriginal = $admin->email;

        $this->actingAs($admin)
            ->post(route('admin.perfil.personal'), [
                'name'  => $admin->name,
                'email' => 'pwned@evil.com',  // se ignora — no está en rules()
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame($emailOriginal, $admin->fresh()->email);
    }

    // ─────────────────────────────────────────────────────────────────
    // Cambio password vía HTTP — verifica hash persistido (e2e sin mocks)
    // ─────────────────────────────────────────────────────────────────

    public function test_cambio_password_via_http_actualiza_hash_en_bd(): void
    {
        $admin = $this->crearAdminConPassword();

        $this->actingAs($admin)
            ->post(route('admin.perfil.personal'), [
                'name'                  => $admin->name,
                'password_actual'       => self::PASSWORD_ACTUAL,
                'password'              => 'NuevaPass456!',
                'password_confirmation' => 'NuevaPass456!',
            ])
            ->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('NuevaPass456!', $admin->fresh()->password));
    }

    // ─────────────────────────────────────────────────────────────────
    // C2 — Action invoca Auth::logoutOtherDevices al cambiar password
    // (test unitario sobre la Action para no chocar con el flow Auth del
    // controller — partialMock() del facade rompería auth()->user())
    // ─────────────────────────────────────────────────────────────────

    public function test_action_invoca_logout_otros_dispositivos_al_cambiar_password(): void
    {
        $admin = $this->crearAdminConPassword();

        Auth::shouldReceive('logoutOtherDevices')
            ->once()
            ->with('NuevaPass456!')
            ->andReturnTrue();

        app(UpdateDatosPersonales::class)->handle($admin, [
            'name'     => $admin->name,
            'password' => 'NuevaPass456!',
        ]);

        $this->assertTrue(Hash::check('NuevaPass456!', $admin->fresh()->password));
    }

    public function test_action_no_invoca_logout_otros_si_no_cambia_password(): void
    {
        $admin = $this->crearAdminConPassword();

        Auth::shouldReceive('logoutOtherDevices')->never();

        app(UpdateDatosPersonales::class)->handle($admin, [
            'name' => 'Solo Nombre Sin Password',
        ]);

        $this->assertSame('Solo Nombre Sin Password', $admin->fresh()->name);
        // Hash original intacto
        $this->assertTrue(Hash::check(self::PASSWORD_ACTUAL, $admin->fresh()->password));
    }

    // ─────────────────────────────────────────────────────────────────
    // C3 — Throttle 10/min
    // ─────────────────────────────────────────────────────────────────

    public function test_throttle_perfil_update_bloquea_tras_10_intentos(): void
    {
        $admin = $this->crearAdminConPassword();

        // 10 hits permitidos (todos con password_actual incorrecta → 422/redirect con error)
        for ($i = 0; $i < 10; $i++) {
            $this->actingAs($admin)
                ->post(route('admin.perfil.personal'), [
                    'name'                  => $admin->name,
                    'password_actual'       => 'incorrecta',
                    'password'              => 'NuevaPass456!',
                    'password_confirmation' => 'NuevaPass456!',
                ]);
        }

        // 11vo hit → 429 Too Many Requests
        $this->actingAs($admin)
            ->post(route('admin.perfil.personal'), [
                'name' => $admin->name,
            ])
            ->assertStatus(429);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function crearAdminConPassword(): User
    {
        $admin = User::factory()->create([
            'role'              => 'admin',
            'email_verified_at' => now(),
            'password'          => Hash::make(self::PASSWORD_ACTUAL),
        ]);
        $admin->assignRole('super-admin');  // super-admin tiene todos los permisos
        return $admin;
    }
}
