<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Configuración de reglas antifraude. Cada regla es código fijo en
 * App\Antifraude\Reglas; esta tabla solo gestiona activación + parámetros.
 *
 * Ejemplos:
 *   - clave=telefono_invalido, activa=true,  parametros={"usar_mastershop": true}
 *   - clave=monto_alto,        activa=true,  parametros={"umbral": 400000}
 *   - clave=cliente_blacklist, activa=true,  parametros=null
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('antifraude_reglas', function (Blueprint $table) {
            $table->id();
            $table->string('clave')->unique();
            $table->boolean('activa')->default(true);
            $table->json('parametros')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('antifraude_reglas');
    }
};
