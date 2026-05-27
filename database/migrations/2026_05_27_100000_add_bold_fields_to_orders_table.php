<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Campos Bold paralelos a los de MercadoPago. La pasarela elegida se sabe
 * por orders.metodo_pago ('mercadopago' | 'bold'). Mantener tracking
 * separado evita colisiones de IDs entre pasarelas y permite reembolsos
 * o auditoría diferenciada.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('bold_payment_id', 100)->nullable()->after('mp_notificado_at')->index();
            $table->string('bold_status', 50)->nullable()->after('bold_payment_id');
            $table->string('bold_link_id', 100)->nullable()->after('bold_status');
            $table->timestamp('bold_notificado_at')->nullable()->after('bold_link_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['bold_payment_id']);
            $table->dropColumn(['bold_payment_id', 'bold_status', 'bold_link_id', 'bold_notificado_at']);
        });
    }
};
