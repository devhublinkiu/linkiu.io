<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuracion_envio', function (Blueprint $table) {
            $table->id();
            $table->enum('modo', ['gratis_global', 'costo_fijo', 'por_zona'])->default('costo_fijo');
            $table->unsignedInteger('costo_fijo')->nullable();
            $table->unsignedInteger('umbral_gratis')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracion_envio');
    }
};
