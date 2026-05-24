<?php

namespace Tests\Feature\Admin;

use App\Models\BlogPost;
use App\Models\User;
use Database\Seeders\PermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Tests del CRUD admin Blog (BL1):
 *  - CRUD completo (create/edit/delete)
 *  - Sanitización XSS del contenido (Purifier)
 *  - Slug duplicado rechazado
 *  - Permisos blogs.crear/editar/eliminar
 *  - published_at se sella al pasar de borrador → publicado
 *  - Imagen destacada se sube a S3 y se elimina al borrar
 */
class BlogPostsCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
        Role::create(['name' => 'admin',       'guard_name' => 'web']);
        $this->seed(PermissionsSeeder::class);
    }

    // ─────────────────────────────────────────────────────────────────
    // CRUD básico
    // ─────────────────────────────────────────────────────────────────

    public function test_store_crea_post_con_estado_borrador_sin_published_at(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();

        $this->actingAs($admin)
            ->post(route('admin.blogs.store'), $this->payloadValido(['estado' => 'borrador']))
            ->assertRedirect(route('admin.blogs.index'))
            ->assertSessionHas('status', 'Post creado correctamente.');

        $post = BlogPost::first();
        $this->assertSame('borrador', $post->estado);
        $this->assertNull($post->published_at);
    }

    public function test_store_publicado_sella_published_at(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();

        $this->actingAs($admin)
            ->post(route('admin.blogs.store'), $this->payloadValido(['estado' => 'publicado']))
            ->assertSessionHasNoErrors();

        $post = BlogPost::first();
        $this->assertSame('publicado', $post->estado);
        $this->assertNotNull($post->published_at);
    }

    public function test_update_de_borrador_a_publicado_sella_published_at(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();
        $post  = BlogPost::create($this->datosBd(['estado' => 'borrador', 'published_at' => null]));

        $this->actingAs($admin)
            ->post(route('admin.blogs.update', $post->id), $this->payloadValido(['estado' => 'publicado']))
            ->assertSessionHasNoErrors();

        $post->refresh();
        $this->assertSame('publicado', $post->estado);
        $this->assertNotNull($post->published_at);
    }

    public function test_update_preserva_published_at_si_ya_estaba_publicado(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();
        $publicadoOriginal = now()->subWeek();
        $post  = BlogPost::create($this->datosBd(['estado' => 'publicado', 'published_at' => $publicadoOriginal]));

        $this->actingAs($admin)
            ->post(route('admin.blogs.update', $post->id), $this->payloadValido(['estado' => 'publicado', 'titulo' => 'Re-editado']))
            ->assertSessionHasNoErrors();

        $post->refresh();
        $this->assertSame('Re-editado', $post->titulo);
        // Comparamos en segundos para evitar diferencia de microsegundos al ida-vuelta MySQL.
        $this->assertSame(
            $publicadoOriginal->format('Y-m-d H:i:s'),
            $post->published_at->format('Y-m-d H:i:s'),
        );
    }

    public function test_destroy_elimina_post_e_imagen_de_s3(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();
        $post  = BlogPost::create($this->datosBd(['imagen_destacada_path' => 'blog/test.jpg']));
        Storage::disk('s3')->put('blog/test.jpg', 'fake');

        $this->actingAs($admin)
            ->delete(route('admin.blogs.destroy', $post->id))
            ->assertSessionHas('status', 'Post eliminado correctamente.');

        $this->assertDatabaseMissing('blog_posts', ['id' => $post->id]);
        Storage::disk('s3')->assertMissing('blog/test.jpg');
    }

    // ─────────────────────────────────────────────────────────────────
    // Sanitización XSS (defensa de raíz)
    // ─────────────────────────────────────────────────────────────────

    public function test_contenido_con_script_es_eliminado_por_purifier(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();

        $this->actingAs($admin)->post(route('admin.blogs.store'), $this->payloadValido([
            'contenido' => '<p>Texto normal</p><script>alert("xss")</script><p>Más texto</p>',
        ]));

        $contenido = BlogPost::first()->contenido;
        $this->assertStringNotContainsString('<script>', $contenido);
        $this->assertStringNotContainsString('alert', $contenido);
        $this->assertStringContainsString('Texto normal', $contenido);
        $this->assertStringContainsString('Más texto', $contenido);
    }

    public function test_contenido_con_onclick_handler_es_eliminado(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();

        $this->actingAs($admin)->post(route('admin.blogs.store'), $this->payloadValido([
            'contenido' => '<a href="https://ok.com" onclick="alert(1)">Click</a>',
        ]));

        $contenido = BlogPost::first()->contenido;
        $this->assertStringNotContainsString('onclick', $contenido);
        $this->assertStringContainsString('href="https://ok.com"', $contenido);
    }

    // ─────────────────────────────────────────────────────────────────
    // Validación
    // ─────────────────────────────────────────────────────────────────

    public function test_slug_duplicado_es_rechazado(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();
        BlogPost::create($this->datosBd(['slug' => 'mi-post']));

        $this->actingAs($admin)
            ->from(route('admin.blogs.create'))
            ->post(route('admin.blogs.store'), $this->payloadValido(['slug' => 'mi-post']))
            ->assertSessionHasErrors('slug');
    }

    public function test_slug_con_caracteres_invalidos_rechazado(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();

        $this->actingAs($admin)
            ->from(route('admin.blogs.create'))
            ->post(route('admin.blogs.store'), $this->payloadValido(['slug' => 'Mi Slug Con Mayus Y Espacios']))
            ->assertSessionHasErrors('slug');
    }

    public function test_titulo_y_contenido_son_obligatorios(): void
    {
        Storage::fake('s3');
        $admin = $this->crearAdmin();

        $this->actingAs($admin)
            ->from(route('admin.blogs.create'))
            ->post(route('admin.blogs.store'), [
                'titulo' => '', 'slug' => 'test', 'contenido' => '', 'estado' => 'borrador',
            ])
            ->assertSessionHasErrors(['titulo', 'contenido']);
    }

    // ─────────────────────────────────────────────────────────────────
    // Permisos
    // ─────────────────────────────────────────────────────────────────

    public function test_admin_sin_permiso_crear_recibe_403(): void
    {
        Storage::fake('s3');
        $admin = User::factory()->create(['role' => 'admin', 'email_verified_at' => now()]);
        // Sin role asignado → sin permisos

        $this->actingAs($admin)
            ->post(route('admin.blogs.store'), $this->payloadValido())
            ->assertStatus(403);
    }

    public function test_admin_sin_permiso_eliminar_recibe_403(): void
    {
        Storage::fake('s3');
        $admin = User::factory()->create(['role' => 'admin', 'email_verified_at' => now()]);
        $post  = BlogPost::create($this->datosBd());

        $this->actingAs($admin)
            ->delete(route('admin.blogs.destroy', $post->id))
            ->assertStatus(403);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────

    private function crearAdmin(): User
    {
        $admin = User::factory()->create([
            'role' => 'admin', 'email_verified_at' => now(),
        ]);
        $admin->assignRole('super-admin');
        return $admin;
    }

    /** Payload para POST (multipart/form-data) */
    private function payloadValido(array $overrides = []): array
    {
        return array_merge([
            'titulo'    => 'Mi primer post',
            'slug'      => 'mi-primer-post',
            'resumen'   => 'Un resumen breve.',
            'contenido' => '<p>Contenido del post</p>',
            'estado'    => 'publicado',
        ], $overrides);
    }

    /** Datos para BlogPost::create() en BD directa */
    private function datosBd(array $overrides = []): array
    {
        static $i = 0;
        $i++;

        return array_merge([
            'titulo'    => "Post BD {$i}",
            'slug'      => "post-bd-{$i}",
            'contenido' => '<p>Contenido</p>',
            'estado'    => 'borrador',
        ], $overrides);
    }
}
