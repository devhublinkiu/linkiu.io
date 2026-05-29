<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Capa 1 Mastershop — enrolamiento de productos.
 *
 * - productos.mastershop_id_product: el ID del producto Mastershop "padre".
 *   Sirve para la búsqueda/visualización en admin.
 * - productos.mastershop_id_variant: usado SOLO cuando el producto Linkiu no
 *   tiene variantes propias. En Mastershop siempre hay una "Default Variant"
 *   incluso si el producto no tiene properties.
 * - variable_items.mastershop_id_variant: para productos Linkiu CON variantes,
 *   cada VariableItem (combinación) apunta a un idVariant específico.
 *
 * Los nombres siguen la convención Mastershop (`idVariant`, `idProduct`) para
 * que el mapping con el JSON de la API sea evidente.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->unsignedInteger('mastershop_id_product')->nullable()->after('unidad');
            $table->unsignedInteger('mastershop_id_variant')->nullable()->after('mastershop_id_product');
            $table->index('mastershop_id_product');
        });

        Schema::table('variable_items', function (Blueprint $table) {
            $table->unsignedInteger('mastershop_id_variant')->nullable()->after('precio_ajuste');
            $table->index('mastershop_id_variant');
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropIndex(['mastershop_id_product']);
            $table->dropColumn(['mastershop_id_product', 'mastershop_id_variant']);
        });

        Schema::table('variable_items', function (Blueprint $table) {
            $table->dropIndex(['mastershop_id_variant']);
            $table->dropColumn('mastershop_id_variant');
        });
    }
};
