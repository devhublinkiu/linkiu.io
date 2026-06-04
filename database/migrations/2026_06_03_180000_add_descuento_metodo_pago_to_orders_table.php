<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Audit-log del descuento por método de pago aplicado en cada orden.
 * Snapshot: si el merchant baja el % en config, las órdenes históricas
 * mantienen el valor que realmente se cobró.
 *
 *  - descuento_metodo_pago : monto efectivo en COP (entero, igual que subtotal/recargo).
 *  - descuento_metodo_tipo : 'fijo' | 'porcentaje' | null (null = no aplicó).
 *  - descuento_metodo_valor: % o $ original configurado al momento de la orden.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedInteger('descuento_metodo_pago')->default(0)->after('recargo');
            $table->string('descuento_metodo_tipo', 20)->nullable()->after('descuento_metodo_pago');
            $table->decimal('descuento_metodo_valor', 10, 2)->nullable()->after('descuento_metodo_tipo');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['descuento_metodo_pago', 'descuento_metodo_tipo', 'descuento_metodo_valor']);
        });
    }
};
