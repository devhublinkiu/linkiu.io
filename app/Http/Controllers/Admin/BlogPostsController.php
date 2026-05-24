<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Blogs\CreateBlogPost;
use App\Actions\Blogs\DeleteBlogPost;
use App\Actions\Blogs\UpdateBlogPost;
use App\Http\Controllers\Controller;
use App\Http\Requests\Blogs\StoreBlogPostRequest;
use App\Http\Requests\Blogs\UpdateBlogPostRequest;
use App\Models\BlogPost;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BlogPostsController extends Controller
{
    public function index(): Response
    {
        abort_if(! auth()->user()->can('blogs.ver'), 403);

        $posts = BlogPost::orderByDesc('id')
            ->paginate(15)
            ->through(fn (BlogPost $p) => [
                'id'                   => $p->id,
                'titulo'               => $p->titulo,
                'slug'                 => $p->slug,
                'estado'               => $p->estado,
                'published_at'         => $p->published_at?->toIso8601String(),
                'imagen_destacada_url' => $p->imagen_destacada_url,
                'created_at'           => $p->created_at->toIso8601String(),
            ]);

        return Inertia::render('admin/blog/Index', [
            'posts' => $posts,
        ]);
    }

    public function create(): Response
    {
        abort_if(! auth()->user()->can('blogs.crear'), 403);

        return Inertia::render('admin/blog/Create');
    }

    public function store(StoreBlogPostRequest $request, CreateBlogPost $action): RedirectResponse
    {
        $action->execute($request->validated());

        return redirect()->route('admin.blogs.index')->with('status', 'Post creado correctamente.');
    }

    public function edit(BlogPost $post): Response
    {
        abort_if(! auth()->user()->can('blogs.editar'), 403);

        return Inertia::render('admin/blog/Edit', [
            'post' => [
                'id'                   => $post->id,
                'titulo'               => $post->titulo,
                'slug'                 => $post->slug,
                'resumen'              => $post->resumen,
                'contenido'            => $post->contenido,
                'estado'               => $post->estado,
                'imagen_destacada_url' => $post->imagen_destacada_url,
            ],
        ]);
    }

    public function update(UpdateBlogPostRequest $request, BlogPost $post, UpdateBlogPost $action): RedirectResponse
    {
        $action->execute($post, $request->validated());

        return back()->with('status', 'Post actualizado correctamente.');
    }

    public function destroy(BlogPost $post, DeleteBlogPost $action): RedirectResponse
    {
        abort_if(! auth()->user()->can('blogs.eliminar'), 403);

        $action->execute($post);

        return back()->with('status', 'Post eliminado correctamente.');
    }
}
