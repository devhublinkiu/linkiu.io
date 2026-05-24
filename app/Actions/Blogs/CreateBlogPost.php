<?php

namespace App\Actions\Blogs;

use App\Models\BlogPost;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mews\Purifier\Facades\Purifier;

class CreateBlogPost
{
    public function execute(array $data): BlogPost
    {
        $imagen = null;

        if (isset($data['imagen']) && $data['imagen'] instanceof UploadedFile) {
            $imagen = $data['imagen']->store('blog', 's3');
        }

        // Sanitización del HTML que viene del editor TipTap — bloquea cualquier
        // intento de <script>, on*= handlers, javascript: URIs, etc. Defensa XSS
        // incluso ante admin malicioso o cuenta comprometida. Config 'default'
        // de Purifier permite tags semánticos típicos (p, h2, h3, ul, ol, a, etc.).
        $contenidoLimpio = Purifier::clean($data['contenido']);

        return BlogPost::create([
            'titulo'                => $data['titulo'],
            'slug'                  => $data['slug'],
            'resumen'               => $data['resumen']   ?? null,
            'contenido'             => $contenidoLimpio,
            'imagen_destacada_path' => $imagen,
            'estado'                => $data['estado'],
            // Si nace publicado, sellamos la fecha. Si es borrador, queda null.
            'published_at'          => $data['estado'] === 'publicado' ? now() : null,
        ]);
    }
}
