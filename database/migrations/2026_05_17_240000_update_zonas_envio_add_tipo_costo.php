<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('zonas_envio', function (Blueprint $table) {
            $table->string('tipo_costo')->default('costo_fijo')->after('departamentos');
            $table->unsignedInteger('umbral_gratis')->nullable()->after('costo');
        });
    }

    public function down(): void
    {
        Schema::table('zonas_envio', function (Blueprint $table) {
            $table->dropColumn(['tipo_costo', 'umbral_gratis']);
        });
    }
};
