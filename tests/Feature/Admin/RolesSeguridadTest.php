<?php

namespace Tests\Feature\Admin;

use App\Actions\Auth\ActivateInvitation;
use App\Models\User;
use App\Models\UserInvitation;
use Database\Seeders\PermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests críticos de seguridad para Roles + Usuarios:
 *  C1 — escalación de privilegios vía permisos protegidos
 *  C2 — creación de admin con role_id de super-admin
 *  C3 — invitation token replay / email mismatch
 *  C4 — phone con basura (XSS persistente)
 */
class RolesSeguridadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();

        // Seed mínimo de roles + permisos
        Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
        Role::create(['name' => 'admin',       'guard_name' => 'web']);
        $this->seed(PermissionsSeeder::class);
    }

    // ─────────────────────────────────────────────────────────────────
    // C1 — Permisos protegidos
    // ─────────────────────────────────────────────────────────────────

    public function test_admin_no_super_no_puede_activar_permiso_protegido_roles(): void
    {
        $admin = $this->crearAdmin('admin');
        $rolCustom = Role::create(['name' => 'sub-admin', 'guard_name' => 'web']);

        $this->actingAs($admin)
            ->postJson(route('admin.roles.toggle-permission', $rolCustom->id), [
                'permiso' => 'roles.editar',
            ])
            ->assertStatus(403)
            ->assertJsonFragment(['error' => 'Solo el super-admin puede modificar permisos del módulo Roles o Usuarios.']);

        // El permiso NO debe haberse asignado
        $this->assertFalse($rolCustom->fresh()->hasPermissionTo('roles.editar'));
    }

    public function test_admin_no_super_no_puede_activar_permiso_protegido_usuarios(): void
    {
        $admin = $this->crearAdmin('admin');
        $rolCustom = Role::create(['name' => 'sub-admin', 'guard_name' => 'web']);

        $this->actingAs($admin)
            ->postJson(route('admin.roles.toggle-permission', $rolCustom->id), [
                'permiso' => 'usuarios.crear',
            ])
            ->assertStatus(403);

        $this->assertFalse($rolCustom->fresh()->hasPermissionTo('usuarios.crear'));
    }

    public function test_super_admin_si_puede_activar_permisos_protegidos(): void
    {
        $superAdmin = $this->crearAdmin('super-admin');
        $rolCustom = Role::create(['name' => 'sub-admin', 'guard_name' => 'web']);

        $this->actingAs($superAdmin)
            ->postJson(route('admin.roles.toggle-permission', $rolCustom->id), [
                'permiso' => 'roles.editar',
            ])
            ->assertStatus(200)
            ->assertJson(['ok' => true, 'activo' => true]);

        $this->assertTrue($rolCustom->fresh()->hasPermissionTo('roles.editar'));
    }

    public function test_admin_no_super_si_puede_activar_permisos_normales(): void
    {
        $admin = $this->crearAdmin('admin');
        $rolCustom = Role::create(['name' => 'sub-admin', 'guard_name' => 'web']);

        $this->actingAs($admin)
            ->postJson(route('admin.roles.toggle-permission', $rolCustom->id), [
                'permiso' => 'productos.ver',
            ])
            ->assertStatus(200)
            ->assertJson(['ok' => true, 'activo' => true]);
    }

    // ─────────────────────────────────────────────────────────────────
    // C2 — role_id super-admin rechazado
    // ─────────────────────────────────────────────────────────────────

    public function test_crear_admin_con_role_super_admin_es_rechazado(): void
    {
        $admin       = $this->crearAdmin('admin');
        $superRoleId = Role::where('name', 'super-admin')->value('id');

        $this->actingAs($admin)
            ->post(route('admin.usuarios.store'), $this->payloadCrearUsuario([
                'role_id' => $superRoleId,
            ]))
            ->assertSessionHasErrors(['role_id']);

        $this->assertDatabaseMissing('users', ['email' => 'nuevo@test.com']);
    }

    public function test_crear_admin_con_role_custom_funciona(): void
    {
        $admin     = $this->crearAdmin('admin');
        $rolCustom = Role::create(['name' => 'editor', 'guard_name' => 'web']);

        $this->actingAs($admin)
            ->post(route('admin.usuarios.store'), $this->payloadCrearUsuario([
                'role_id' => $rolCustom->id,
            ]))
            ->assertSessionDoesntHaveErrors();

        $this->assertDatabaseHas('users', ['email' => 'nuevo@test.com', 'role' => 'admin']);
        $this->assertDatabaseHas('user_invitations', ['email' => 'nuevo@test.com', 'consumed_at' => null]);
    }

    // ─────────────────────────────────────────────────────────────────
    // C3 — Invitación: replay + email mismatch
    // ─────────────────────────────────────────────────────────────────

    public function test_activar_invitacion_con_token_invalido_falla(): void
    {
        $resultado = app(ActivateInvitation::class)->execute('token-inexistente', 'newPass123');
        $this->assertSame(['error' => 'token_invalido'], $resultado);
    }

    public function test_activar_invitacion_consumida_falla_replay(): void
    {
        $usuario = User::factory()->create();
        $invitacion = UserInvitation::create([
            'token'       => str_repeat('a', 64),
            'user_id'     => $usuario->id,
            'email'       => $usuario->email,
            'expires_at'  => now()->addHours(48),
            'consumed_at' => now(),  // ya consumida
        ]);

        $resultado = app(ActivateInvitation::class)->execute(str_repeat('a', 64), 'newPass123');
        $this->assertSame(['error' => 'token_invalido'], $resultado);
    }

    public function test_activar_invitacion_expirada_falla(): void
    {
        $usuario = User::factory()->create();
        UserInvitation::create([
            'token'      => str_repeat('b', 64),
            'user_id'    => $usuario->id,
            'email'      => $usuario->email,
            'expires_at' => now()->subHour(),  // expirada
        ]);

        $resultado = app(ActivateInvitation::class)->execute(str_repeat('b', 64), 'newPass123');
        $this->assertSame(['error' => 'token_invalido'], $resultado);
    }

    public function test_activar_invitacion_con_email_distinto_falla(): void
    {
        $usuario = User::factory()->create(['email' => 'actual@test.com']);
        UserInvitation::create([
            'token'      => str_repeat('c', 64),
            'user_id'    => $usuario->id,
            'email'      => 'original@test.com',  // email cambió tras invitar
            'expires_at' => now()->addHours(48),
        ]);

        $resultado = app(ActivateInvitation::class)->execute(str_repeat('c', 64), 'newPass123');
        $this->assertSame(['error' => 'token_invalido'], $resultado);
    }

    public function test_activar_invitacion_valida_marca_consumed_y_setea_password(): void
    {
        $usuario = User::factory()->create(['email_verified_at' => null, 'password' => 'temp']);
        $invitacion = UserInvitation::create([
            'token'      => str_repeat('d', 64),
            'user_id'    => $usuario->id,
            'email'      => $usuario->email,
            'expires_at' => now()->addHours(48),
        ]);

        $resultado = app(ActivateInvitation::class)->execute(str_repeat('d', 64), 'NewSecurePass123');

        $this->assertSame(['ok' => true], $resultado);
        $invitacion->refresh();
        $this->assertNotNull($invitacion->consumed_at);
        $usuario->refresh();
        $this->assertNotNull($usuario->email_verified_at);
        $this->assertTrue(\Hash::check('NewSecurePass123', $usuario->password));
    }

    // ─────────────────────────────────────────────────────────────────
    // C4 — Phone con basura
    // ─────────────────────────────────────────────────────────────────

    public function test_crear_admin_con_phone_basura_es_rechazado(): void
    {
        $admin     = $this->crearAdmin('admin');
        $rolCustom = Role::create(['name' => 'editor', 'guard_name' => 'web']);

        $this->actingAs($admin)
            ->post(route('admin.usuarios.store'), $this->payloadCrearUsuario([
                'role_id' => $rolCustom->id,
                'phone'   => '<script>alert(1)</script>',
            ]))
            ->assertSessionHasErrors(['phone']);
    }

    public function test_crear_admin_con_phone_movil_co_valido_funciona(): void
    {
        $admin     = $this->crearAdmin('admin');
        $rolCustom = Role::create(['name' => 'editor', 'guard_name' => 'web']);

        $this->actingAs($admin)
            ->post(route('admin.usuarios.store'), $this->payloadCrearUsuario([
                'role_id' => $rolCustom->id,
                'phone'   => '3001234567',  // móvil CO válido
            ]))
            ->assertSessionDoesntHaveErrors();
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function crearAdmin(string $rolNombre): User
    {
        $usuario = User::factory()->create([
            'role'              => 'admin',
            'email_verified_at' => now(),
        ]);
        $usuario->assignRole($rolNombre);

        // Asignar permisos del rol al admin para que las rutas con `can:`
        // pasen. Super-admin lo cubre el Gate::before. Para 'admin' damos
        // los permisos roles.* y usuarios.* explícitamente.
        if ($rolNombre === 'admin') {
            $rol = Role::where('name', 'admin')->first();
            foreach (['roles.editar', 'usuarios.crear'] as $p) {
                $rol->givePermissionTo($p);
            }
        }

        return $usuario;
    }

    private function payloadCrearUsuario(array $overrides = []): array
    {
        return array_merge([
            'name'     => 'Nuevo Usuario',
            'email'    => 'nuevo@test.com',
            'phone'    => '3001234567',
            'gender'   => 'masculino',
            'username' => 'nuevo_user',
            'role_id'  => 1,
        ], $overrides);
    }
}
