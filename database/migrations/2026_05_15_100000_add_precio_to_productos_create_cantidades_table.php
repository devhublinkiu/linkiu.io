<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->decimal('precio_base', 12, 2)->nullable()->after('status');
            $table->boolean('aplica_iva')->default(false)->after('precio_base');
            $table->decimal('iva_porcentaje', 5, 2)->default(0)->after('aplica_iva');
        });

        Schema::create('producto_cantidades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->string('imagen')->nullable();
            $table->unsignedInteger('cantidad');
            $table->decimal('precio_bundle', 12, 2);
            $table->string('badge_texto', 50)->nullable();
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('producto_cantidades');

        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn(['precio_base', 'aplica_iva', 'iva_porcentaje']);
        });
    }
};
