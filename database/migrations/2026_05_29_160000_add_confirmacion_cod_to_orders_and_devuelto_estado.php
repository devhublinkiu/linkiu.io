<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Capa 3 — Confirmación COD vía WhatsApp.
 *
 * 1) Agrega columnas de tracking del flujo de confirmación:
 *    - confirmacion_solicitada_at  → cuándo se envió la plantilla con botones
 *    - confirmacion_reenviada      → si admin la reenvió manualmente (máx 1)
 *    - confirmacion_respondida_at  → cuándo respondió el cliente vía webhook
 *    - confirmacion_respuesta      → 'si' o 'no' del botón presionado
 *
 * 2) Amplía el enum `estado` para incluir 'devuelto' — se usa cuando el pedido
 *    fue entregado/enviado y el cliente lo rechazó físicamente (caso típico
 *    en COD). Distinto de 'cancelado' que es pre-envío.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('confirmacion_solicitada_at')->nullable()->after('revision_comentario');
            $table->boolean('confirmacion_reenviada')->default(false)->after('confirmacion_solicitada_at');
            $table->timestamp('confirmacion_respondida_at')->nullable()->after('confirmacion_reenviada');
            $table->enum('confirmacion_respuesta', ['si', 'no'])->nullable()->after('confirmacion_respondida_at');
        });

        // Modificar enum `estado` para agregar 'devuelto'. Doctrine/DBAL no soporta
        // ALTER de enums en Schema::table, así que usamos SQL crudo.
        DB::statement("ALTER TABLE orders MODIFY estado ENUM('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado', 'devuelto') DEFAULT 'pendiente'");
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'confirmacion_solicitada_at',
                'confirmacion_reenviada',
                'confirmacion_respondida_at',
                'confirmacion_respuesta',
            ]);
        });

        // Atención: si hay órdenes en estado 'devuelto', el ALTER fallará.
        // La migration down debería usarse solo en entornos de dev.
        DB::statement("ALTER TABLE orders MODIFY estado ENUM('pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente'");
    }
};
