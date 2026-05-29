<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Blacklist manual gestionada por el admin. Se aplica vía regla
 * `cliente_blacklist` del motor antifraude. El admin agrega teléfono o email
 * cuando un cliente ha hecho devoluciones / fraudes documentados.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes_blacklist', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['telefono', 'email']);
            $table->string('valor');
            $table->string('motivo')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->unique(['tipo', 'valor']);
            $table->index('valor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes_blacklist');
    }
};
