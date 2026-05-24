<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Audit log de cambios de credenciales secretas (MP access tokens,
     * webhook secret).
     *
     * NO guarda los valores — solo metadata: quién cambió qué clave,
     * cuándo, y si pasó de "vacío" a "configurado" o viceversa.
     * Suficiente para compliance sin riesgo de leak adicional.
     */
    public function up(): void
    {
        Schema::create('integraciones_audit', function (Blueprint $table) {
            $table->id();
            $table->string('clave');
            $table->boolean('was_set');   // true si tenía valor antes del cambio
            $table->boolean('is_set');    // true si tiene valor después
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at');
            $table->index(['clave', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integraciones_audit');
    }
};
