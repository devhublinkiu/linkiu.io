<?php

namespace App\Actions\Blogs;

use App\Models\BlogPost;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mews\Purifier\Facades\Purifier;

class UpdateBlogPost
{
    public function execute(BlogPost $post, array $data): BlogPost
    {
        $imagenPath = $post->imagen_destacada_path;

        if (isset($data['imagen']) && $data['imagen'] instanceof UploadedFile) {
            // Elimina la imagen previa para no acumular huérfanos en S3.
            if ($imagenPath) {
                Storage::disk('s3')->delete($imagenPath);
            }
            $imagenPath = $data['imagen']->store('blog', 's3');
        }

        $contenidoLimpio = Purifier::clean($data['contenido']);

        // Si el post pasa de borrador a publicado por primera vez, sellamos
        // published_at. Si ya tenía fecha (re-publicación) la respetamos para
        // no romper el orden cronológico de los lectores.
        $publishedAt = $post->published_at;
        if ($data['estado'] === 'publicado' && $publishedAt === null) {
            $publishedAt = now();
        }

        $post->update([
            'titulo'                => $data['titulo'],
            'slug'                  => $data['slug'],
            'resumen'               => $data['resumen']   ?? null,
            'contenido'             => $contenidoLimpio,
            'imagen_destacada_path' => $imagenPath,
            'estado'                => $data['estado'],
            'published_at'          => $publishedAt,
        ]);

        return $post;
    }
}
