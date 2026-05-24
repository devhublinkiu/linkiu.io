<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 200);
            $table->string('slug', 220)->unique();
            $table->string('resumen', 300)->nullable();
            // contenido HTML ya sanitizado (output de TipTap pasado por purifier).
            // longText soporta hasta 4GB — más que suficiente para artículos largos.
            $table->longText('contenido');
            // Path en S3 (categorias/x.jpg estilo) — null si no se subió imagen.
            $table->string('imagen_destacada_path', 500)->nullable();
            $table->enum('estado', ['borrador', 'publicado'])->default('borrador');
            // published_at se setea cuando el post pasa a estado='publicado' por primera vez.
            // Permite ordenar por fecha de publicación real (no por created_at, que es
            // cuando se creó el borrador).
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // Listado público: WHERE estado='publicado' ORDER BY published_at DESC
            $table->index(['estado', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
