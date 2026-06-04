<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Audit-log de resets de datos de Funelinks (visitante_sesiones, product_views,
 * fomo_view_logs) hechos desde /admin/reset-campana. Inmutable.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('funelinks_reset_logs', function (Blueprint $table) {
            $table->id();
            $table->date('rango_desde');
            $table->date('rango_hasta');
            $table->foreignId('producto_id')->nullable()->constrained('productos')->nullOnDelete();
            $table->boolean('borrado_sesiones')->default(false);
            $table->boolean('borrado_visitas')->default(false);
            $table->boolean('borrado_fomo')->default(false);
            $table->unsignedInteger('conteo_sesiones')->default(0);
            $table->unsignedInteger('conteo_visitas')->default(0);
            $table->unsignedInteger('conteo_fomo')->default(0);
            $table->text('motivo');
            $table->foreignId('ejecutado_por')->constrained('users');
            $table->timestamp('ejecutado_at');
            $table->timestamps();

            $table->index('ejecutado_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funelinks_reset_logs');
    }
};
