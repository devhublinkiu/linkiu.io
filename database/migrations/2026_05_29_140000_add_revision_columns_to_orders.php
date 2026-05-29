<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Capa 2 Antifraude — extiende `orders` con un eje separado del flujo normal
 * de estados (`pendiente/confirmado/preparando/...`). `revision_estado` evalúa
 * el RIESGO de despachar la orden; `estado` evalúa su PROCESAMIENTO.
 *
 * Combinaciones válidas:
 *   estado=pendiente + revision=NULL        → flujo normal sin antifraude o pasó automático
 *   estado=pendiente + revision=pendiente   → bloqueada hasta que admin apruebe
 *   estado=pendiente + revision=aprobada    → admin la liberó, sigue flujo normal
 *   estado=cancelado + revision=rechazada   → admin la rechazó
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('revision_estado', ['pendiente', 'aprobada', 'rechazada'])
                ->nullable()
                ->after('estado')
                ->index();
            $table->json('revision_motivos')->nullable()->after('revision_estado');
            $table->unsignedBigInteger('revision_revisada_por')->nullable()->after('revision_motivos');
            $table->timestamp('revision_revisada_at')->nullable()->after('revision_revisada_por');
            $table->text('revision_comentario')->nullable()->after('revision_revisada_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['revision_estado']);
            $table->dropColumn([
                'revision_estado',
                'revision_motivos',
                'revision_revisada_por',
                'revision_revisada_at',
                'revision_comentario',
            ]);
        });
    }
};
