<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    /** TTL en segundos. Bajo porque los posts pueden cambiar y los lectores
     *  esperan novedades. 5 min es suficiente para amortizar tráfico medio. */
    private const CACHE_TTL = 300;

    /**
     * Listado paginado de posts publicados (más recientes primero).
     */
    public function index(Request $request): Response
    {
        $page = (int) ($request->query('page', 1));
        $key  = "blog:listado:p{$page}";

        $posts = Cache::remember($key, self::CACHE_TTL, function () {
            return BlogPost::publicados()
                ->recientes()
                ->paginate(9)
                ->through(fn (BlogPost $p) => [
                    'id'                   => $p->id,
                    'titulo'               => $p->titulo,
                    'slug'                 => $p->slug,
                    'resumen'              => $p->resumen,
                    'imagen_destacada_url' => $p->imagen_destacada_url,
                    'published_at'         => $p->published_at?->toIso8601String(),
                ])
                ->toArray();
        });

        return Inertia::render('public/Blog', [
            'posts' => $posts,
        ]);
    }

    /**
     * Detalle de un post por slug. 404 si no existe, no está publicado, o tiene
     * `published_at` futuro (post programado).
     */
    public function show(string $slug): Response
    {
        $post = Cache::remember("blog:post:{$slug}", self::CACHE_TTL, function () use ($slug) {
            $post = BlogPost::publicados()->where('slug', $slug)->first();
            return $post ? [
                'id'                   => $post->id,
                'titulo'               => $post->titulo,
                'slug'                 => $post->slug,
                'resumen'              => $post->resumen,
                'contenido'            => $post->contenido,
                'imagen_destacada_url' => $post->imagen_destacada_url,
                'published_at'         => $post->published_at?->toIso8601String(),
            ] : null;
        });

        abort_if($post === null, 404);

        $relacionados = Cache::remember("blog:relacionados:{$slug}", self::CACHE_TTL, function () use ($post) {
            return BlogPost::publicados()
                ->where('id', '!=', $post['id'])
                ->recientes()
                ->take(3)
                ->get()
                ->map(fn (BlogPost $p) => [
                    'titulo'               => $p->titulo,
                    'slug'                 => $p->slug,
                    'imagen_destacada_url' => $p->imagen_destacada_url,
                    'published_at'         => $p->published_at?->toIso8601String(),
                ])
                ->all();
        });

        return Inertia::render('public/BlogPost', [
            'post'         => $post,
            'relacionados' => $relacionados,
        ]);
    }
}
