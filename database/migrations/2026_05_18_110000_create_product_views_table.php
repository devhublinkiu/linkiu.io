<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->date('fecha');
            $table->unsignedInteger('visitas')->default(0);
            $table->unsignedBigInteger('scroll_depth_sum')->default(0);
            $table->unsignedInteger('scroll_depth_count')->default(0);
            $table->unique(['producto_id', 'fecha']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_views');
    }
};
