<?php

namespace Tests\Feature\Public;

use App\Models\BlogPost;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Tests del frontend público del blog (BL2):
 *  - Listado solo muestra posts publicados
 *  - Detalle 404 si no existe / es borrador / está programado a futuro
 *  - Posts relacionados excluyen el actual y solo muestran publicados
 *  - Invalidación de cache al crear/actualizar/eliminar
 */
class BlogPublicTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    // ─────────────────────────────────────────────────────────────────
    // Listado /blog
    // ─────────────────────────────────────────────────────────────────

    public function test_listado_solo_muestra_publicados(): void
    {
        $this->crearPost(['estado' => 'borrador',   'published_at' => null,            'slug' => 'borrador-1']);
        $this->crearPost(['estado' => 'publicado',  'published_at' => now()->subDay(), 'slug' => 'publicado-1']);
        $this->crearPost(['estado' => 'publicado',  'published_at' => now()->subHour(), 'slug' => 'publicado-2']);

        $this->get(route('blog.index'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p
                ->component('public/Blog')
                ->where('posts.total', 2)
            );
    }

    public function test_listado_excluye_posts_programados_a_futuro(): void
    {
        $this->crearPost(['estado' => 'publicado', 'published_at' => now()->subDay(),  'slug' => 'visible']);
        $this->crearPost(['estado' => 'publicado', 'published_at' => now()->addDay(),  'slug' => 'futuro']);

        $this->get(route('blog.index'))
            ->assertInertia(fn ($p) => $p->where('posts.total', 1));
    }

    public function test_listado_funciona_sin_posts(): void
    {
        $this->get(route('blog.index'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p->where('posts.total', 0));
    }

    // ─────────────────────────────────────────────────────────────────
    // Detalle /blog/{slug}
    // ─────────────────────────────────────────────────────────────────

    public function test_show_404_si_slug_no_existe(): void
    {
        $this->get(route('blog.show', 'inexistente'))->assertNotFound();
    }

    public function test_show_404_si_post_es_borrador(): void
    {
        $this->crearPost(['estado' => 'borrador', 'published_at' => null, 'slug' => 'oculto']);

        $this->get(route('blog.show', 'oculto'))->assertNotFound();
    }

    public function test_show_404_si_post_programado_a_futuro(): void
    {
        $this->crearPost(['estado' => 'publicado', 'published_at' => now()->addDay(), 'slug' => 'futuro']);

        $this->get(route('blog.show', 'futuro'))->assertNotFound();
    }

    public function test_show_muestra_post_publicado(): void
    {
        $this->crearPost([
            'estado'       => 'publicado',
            'published_at' => now()->subDay(),
            'slug'         => 'mi-post',
            'titulo'       => 'Mi título',
            'contenido'    => '<p>Contenido HTML</p>',
        ]);

        $this->get(route('blog.show', 'mi-post'))
            ->assertOk()
            ->assertInertia(fn ($p) => $p
                ->component('public/BlogPost')
                ->where('post.titulo',    'Mi título')
                ->where('post.contenido', '<p>Contenido HTML</p>')
            );
    }

    // ─────────────────────────────────────────────────────────────────
    // Relacionados
    // ─────────────────────────────────────────────────────────────────

    public function test_relacionados_excluyen_el_post_actual_y_solo_publicados(): void
    {
        $this->crearPost(['slug' => 'actual',  'estado' => 'publicado', 'published_at' => now()->subDay()]);
        $this->crearPost(['slug' => 'otro-1',  'estado' => 'publicado', 'published_at' => now()->subDays(2)]);
        $this->crearPost(['slug' => 'otro-2',  'estado' => 'publicado', 'published_at' => now()->subDays(3)]);
        $this->crearPost(['slug' => 'oculto',  'estado' => 'borrador',  'published_at' => null]);
        $this->crearPost(['slug' => 'futuro',  'estado' => 'publicado', 'published_at' => now()->addDay()]);

        $this->get(route('blog.show', 'actual'))
            ->assertInertia(fn ($p) => $p
                ->has('relacionados', 2)  // otro-1, otro-2 (NO el actual, NO el borrador, NO el futuro)
            );
    }

    public function test_relacionados_se_limita_a_3(): void
    {
        // Creamos 5 publicados (uno es 'actual') → relacionados debe traer 3 max
        for ($i = 1; $i <= 5; $i++) {
            $this->crearPost([
                'slug'         => "p{$i}",
                'estado'       => 'publicado',
                'published_at' => now()->subDays($i),
            ]);
        }

        $this->get(route('blog.show', 'p1'))
            ->assertInertia(fn ($p) => $p->has('relacionados', 3));
    }

    // ─────────────────────────────────────────────────────────────────
    // Cache invalidation
    // ─────────────────────────────────────────────────────────────────

    public function test_invalidacion_de_cache_al_crear_post(): void
    {
        // Primer request: vacío, cache vacío
        $this->get(route('blog.index'))
            ->assertInertia(fn ($p) => $p->where('posts.total', 0));

        // Crear un post — el booted() invalida el cache
        $this->crearPost(['estado' => 'publicado', 'published_at' => now()->subDay()]);

        // Siguiente request debe ver el post nuevo
        $this->get(route('blog.index'))
            ->assertInertia(fn ($p) => $p->where('posts.total', 1));
    }

    public function test_invalidacion_al_cambiar_slug_limpia_cache_de_ambos_slugs(): void
    {
        $post = $this->crearPost([
            'slug'         => 'slug-original',
            'estado'       => 'publicado',
            'published_at' => now()->subDay(),
        ]);

        // Primer hit cachea
        $this->get(route('blog.show', 'slug-original'))->assertOk();

        // Cambiar slug
        $post->update(['slug' => 'slug-nuevo']);

        // El slug viejo ya no debe responder
        $this->get(route('blog.show', 'slug-original'))->assertNotFound();
        // El nuevo sí
        $this->get(route('blog.show', 'slug-nuevo'))->assertOk();
    }

    // ─────────────────────────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────────────────────────

    private function crearPost(array $overrides = []): BlogPost
    {
        static $i = 0;
        $i++;

        return BlogPost::create(array_merge([
            'titulo'    => "Post {$i}",
            'slug'      => "post-{$i}",
            'contenido' => '<p>Contenido</p>',
            'estado'    => 'borrador',
        ], $overrides));
    }
}
