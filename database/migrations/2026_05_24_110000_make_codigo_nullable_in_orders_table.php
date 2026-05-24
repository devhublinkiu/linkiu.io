<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * El observer `Order::booted->created` asigna `codigo` LNK-XXXXXX
     * DESPUÉS del INSERT (necesita el `id` autoincrement ya asignado).
     * En MySQL con SQL mode strict el INSERT fallaba porque `codigo`
     * era NOT NULL sin default — bug latente que solo se exponía bajo
     * strict mode.
     *
     * Hacer la columna nullable permite el INSERT inicial; el observer
     * la rellena inmediatamente después dentro del mismo request. El
     * unique constraint se mantiene (NULL != NULL en unique de MySQL).
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('codigo')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('codigo')->nullable(false)->change();
        });
    }
};
