<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Tabla de tokens de invitación para activación de cuenta admin.
     *
     * Reemplaza el almacenamiento previo en cache (que tenía problemas:
     * persistencia volátil, sin idempotencia, sin validación de email).
     *
     * Diseño:
     *  - `token` unique índice — el lookup por token debe ser O(1)
     *  - `email` snapshot del email al momento de invitar; si el admin
     *    cambia el email del usuario después, el token queda inválido
     *  - `expires_at` timestamp explícito (48h por defecto)
     *  - `consumed_at` nullable — `null` = activo, no null = ya usado
     *  - Cascada al borrar usuario (sus invitaciones desaparecen)
     */
    public function up(): void
    {
        Schema::create('user_invitations', function (Blueprint $table) {
            $table->id();
            $table->string('token', 64)->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('email');
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();
            $table->index(['expires_at', 'consumed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_invitations');
    }
};
