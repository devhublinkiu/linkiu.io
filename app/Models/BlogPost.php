<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class BlogPost extends Model
{
    protected $fillable = [
        'titulo',
        'slug',
        'resumen',
        'contenido',
        'imagen_destacada_path',
        'estado',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    // ─────────────────────────────────────────────────────────────────
    // Scopes
    // ─────────────────────────────────────────────────────────────────

    /**
     * Posts visibles públicamente: estado='publicado' Y published_at <= ahora
     * (permite programar posts a futuro escribiendo el published_at en la BD).
     */
    public function scopePublicados(Builder $q): Builder
    {
        return $q->where('estado', 'publicado')
            ->where('published_at', '<=', now());
    }

    /**
     * Orden cronológico inverso por fecha de publicación. Los borradores sin
     * `published_at` quedan al final naturalmente (NULL ordena last en MySQL DESC).
     */
    public function scopeRecientes(Builder $q): Builder
    {
        return $q->orderByDesc('published_at')->orderByDesc('id');
    }

    // ─────────────────────────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────────────────────────

    /**
     * URL pública del post — usada en el frontend admin y en SEO meta.
     */
    public function getUrlAttribute(): string
    {
        return route('blog.show', $this->slug);
    }

    /**
     * URL de la imagen destacada en S3. null si no tiene imagen.
     */
    public function getImagenDestacadaUrlAttribute(): ?string
    {
        return $this->imagen_destacada_path
            ? Storage::disk('s3')->url($this->imagen_destacada_path)
            : null;
    }

    // ─────────────────────────────────────────────────────────────────
    // Cache invalidation (público)
    // ─────────────────────────────────────────────────────────────────

    /**
     * Cuando se crea/actualiza/elimina un post, invalidamos las cache keys
     * del frontend público para que los lectores vean los cambios en el
     * siguiente request (sin esperar el TTL de 5 min).
     */
    protected static function booted(): void
    {
        $invalidar = function (BlogPost $post) {
            // Listado: limpiar páginas 1-10 (cubre el caso típico). Si hay >10
            // páginas se renueva por TTL natural, no es crítico.
            for ($i = 1; $i <= 10; $i++) {
                Cache::forget("blog:listado:p{$i}");
            }
            Cache::forget("blog:post:{$post->slug}");
            Cache::forget("blog:relacionados:{$post->slug}");

            // Si cambió el slug, invalidar también el slug original
            if ($post->wasChanged('slug') && $post->getOriginal('slug')) {
                Cache::forget("blog:post:{$post->getOriginal('slug')}");
                Cache::forget("blog:relacionados:{$post->getOriginal('slug')}");
            }
        };

        static::created($invalidar);
        static::updated($invalidar);
        static::deleted($invalidar);
    }
}
