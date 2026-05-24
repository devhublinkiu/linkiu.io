<?php

namespace Tests\Feature\Admin;

use App\Models\BlogPost;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * Tests del modelo BlogPost (BL0):
 *  - Scopes publicados/recientes
 *  - Programación a futuro (published_at > now no aparece todavía)
 *  - Slug único (constraint a nivel de BD)
 *  - Casts (published_at → Carbon)
 */
class BlogPostModelTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────────
    // Scope publicados()
    // ─────────────────────────────────────────────────────────────────

    public function test_publicados_solo_devuelve_estado_publicado(): void
    {
        $this->crearPost(['estado' => 'borrador',   'published_at' => null]);
        $this->crearPost(['estado' => 'publicado',  'published_at' => now()->subDay()]);
        $this->crearPost(['estado' => 'publicado',  'published_at' => now()->subHour()]);

        $this->assertSame(2, BlogPost::publicados()->count());
    }

    public function test_publicados_excluye_posts_programados_a_futuro(): void
    {
        $this->crearPost(['estado' => 'publicado', 'published_at' => now()->subDay()]);   // visible
        $this->crearPost(['estado' => 'publicado', 'published_at' => now()->addDay()]);   // futuro — NO visible
        $this->crearPost(['estado' => 'publicado', 'published_at' => now()->addHour()]);  // futuro — NO visible

        $this->assertSame(1, BlogPost::publicados()->count());
    }

    public function test_publicados_excluye_borradores_aunque_tengan_published_at(): void
    {
        $this->crearPost(['estado' => 'borrador',  'published_at' => now()->subWeek()]);  // borrador con fecha → no visible
        $this->crearPost(['estado' => 'publicado', 'published_at' => now()->subDay()]);

        $this->assertSame(1, BlogPost::publicados()->count());
    }

    // ─────────────────────────────────────────────────────────────────
    // Scope recientes() — DESC por published_at
    // ─────────────────────────────────────────────────────────────────

    public function test_recientes_ordena_descendente_por_published_at(): void
    {
        $viejo  = $this->crearPost(['titulo' => 'Viejo',  'slug' => 'viejo',  'published_at' => now()->subDays(10)]);
        $reciente = $this->crearPost(['titulo' => 'Reciente', 'slug' => 'reciente', 'published_at' => now()->subDay()]);
        $medio  = $this->crearPost(['titulo' => 'Medio',  'slug' => 'medio',  'published_at' => now()->subDays(5)]);

        $orden = BlogPost::recientes()->pluck('id')->all();
        $this->assertSame([$reciente->id, $medio->id, $viejo->id], $orden);
    }

    // ─────────────────────────────────────────────────────────────────
    // Constraints
    // ─────────────────────────────────────────────────────────────────

    public function test_slug_es_unico_a_nivel_de_bd(): void
    {
        $this->crearPost(['slug' => 'mi-post']);

        $this->expectException(\Illuminate\Database\QueryException::class);

        $this->crearPost(['slug' => 'mi-post']);
    }

    public function test_estado_invalido_rechazado_por_enum(): void
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        BlogPost::create([
            'titulo'    => 'X',
            'slug'      => 'x',
            'contenido' => '<p>test</p>',
            'estado'    => 'pendiente_revision',  // no es 'borrador' ni 'publicado'
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    // Casts
    // ─────────────────────────────────────────────────────────────────

    public function test_published_at_se_castea_a_carbon(): void
    {
        $post = $this->crearPost(['published_at' => '2026-05-24 10:00:00']);

        $this->assertInstanceOf(Carbon::class, $post->fresh()->published_at);
    }

    public function test_imagen_destacada_url_devuelve_null_sin_imagen(): void
    {
        $post = $this->crearPost(['imagen_destacada_path' => null]);

        $this->assertNull($post->imagen_destacada_url);
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────────────────────────

    private function crearPost(array $overrides = []): BlogPost
    {
        static $i = 0;
        $i++;

        return BlogPost::create(array_merge([
            'titulo'       => "Post {$i}",
            'slug'         => "post-{$i}",
            'resumen'      => null,
            'contenido'    => '<p>Contenido del post</p>',
            'estado'       => 'borrador',
            'published_at' => null,
        ], $overrides));
    }
}
