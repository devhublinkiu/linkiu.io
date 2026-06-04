<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Audit-log de eliminaciones de órdenes hechas desde /admin/reset-campana o el
 * bulk delete del Index. Las órdenes se hard-deletean (cascadea items y borra
 * comprobantes en S3), pero este registro queda inmutable como trazabilidad
 * contable: quién, cuándo, cuánto, con qué motivo.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('order_deletion_logs', function (Blueprint $table) {
            $table->id();
            $table->json('codigos');
            $table->text('motivo');
            $table->unsignedBigInteger('total_eliminado_cop')->default(0);
            $table->foreignId('eliminado_por')->constrained('users');
            $table->timestamp('eliminado_at');
            $table->timestamps();

            $table->index('eliminado_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_deletion_logs');
    }
};
