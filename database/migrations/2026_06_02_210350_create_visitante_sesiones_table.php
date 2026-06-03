<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitante_sesiones', function (Blueprint $table) {
            $table->id();
            $table->string('visitante_hash', 16);              // ej: Visit-A4F2 — anonimo
            $table->string('pagina_entrada', 200);              // primera pagina vista
            $table->string('pagina_salida', 200);               // ultima pagina vista
            $table->foreignId('producto_id')->nullable()->constrained('productos')->nullOnDelete();
            $table->string('origen', 20);                       // facebook | instagram | google | direct | otros
            $table->string('dispositivo', 10);                  // movil | desktop | tablet
            $table->string('ciudad', 80)->nullable();
            $table->string('pais', 2)->nullable();
            $table->json('recorrido');                          // [{s:'gancho_promesa',t:0,d:12},{s:'tabla',t:12,d:30}]
            $table->string('seccion_final', 60)->nullable();    // ultima seccion vista (cuello del funnel)
            $table->unsignedInteger('duracion_segundos');
            $table->timestamp('inicio');
            $table->timestamp('fin');
            $table->timestamps();

            $table->index(['inicio', 'producto_id']);
            $table->index(['origen', 'inicio']);
            $table->index('visitante_hash');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitante_sesiones');
    }
};
