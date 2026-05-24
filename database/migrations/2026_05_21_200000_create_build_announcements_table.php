<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('build_announcements', function (Blueprint $table) {
            $table->id();
            $table->string('texto', 200);
            $table->string('emoji', 10)->nullable();
            $table->string('btn_texto', 50)->nullable();
            $table->string('btn_link', 500)->nullable();
            $table->dateTime('fin_timer')->nullable();
            $table->boolean('activo')->default(true);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('build_announcements');
    }
};
