<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Garantiza índice en `order_items.producto_id`.
     *
     * MySQL crea índice implícito al declarar la foreign key, pero SQLite
     * no — el JOIN para `producto_top` en el detalle de cliente termina en
     * full scan. Esta migración agrega el índice explícito si todavía no
     * existe para que ambos drivers se comporten igual.
     */
    public function up(): void
    {
        $existe = collect(Schema::getIndexes('order_items'))
            ->contains(fn ($idx) => in_array('producto_id', (array) ($idx['columns'] ?? [])));

        if (! $existe) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->index('producto_id', 'order_items_producto_id_index');
            });
        }
    }

    public function down(): void
    {
        $existe = collect(Schema::getIndexes('order_items'))
            ->contains(fn ($idx) => ($idx['name'] ?? null) === 'order_items_producto_id_index');

        if ($existe) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropIndex('order_items_producto_id_index');
            });
        }
    }
};
