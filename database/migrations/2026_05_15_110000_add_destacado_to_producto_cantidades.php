<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('producto_cantidades', function (Blueprint $table) {
            $table->boolean('destacado')->default(false)->after('badge_texto');
        });
    }

    public function down(): void
    {
        Schema::table('producto_cantidades', function (Blueprint $table) {
            $table->dropColumn('destacado');
        });
    }
};
