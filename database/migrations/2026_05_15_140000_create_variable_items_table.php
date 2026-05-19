<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('variable_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grupo_id')->constrained('variable_grupos')->cascadeOnDelete();
            $table->string('nombre');
            $table->string('valor')->nullable();
            $table->decimal('precio_ajuste', 10, 2)->nullable();
            $table->boolean('activo')->default(true);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('variable_items');
    }
};
