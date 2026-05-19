<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('configuracion_envio');
    }

    public function down(): void
    {
        Schema::create('configuracion_envio', function ($table) {
            $table->id();
            $table->string('modo')->default('costo_fijo');
            $table->unsignedInteger('costo_fijo')->nullable();
            $table->unsignedInteger('umbral_gratis')->nullable();
            $table->timestamps();
        });
    }
};
