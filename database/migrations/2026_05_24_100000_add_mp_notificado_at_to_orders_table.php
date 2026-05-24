<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Tracking explícito de "ya notifiqué al cliente sobre este pago".
     *
     * MP reenvía webhooks múltiples veces (best practice de su parte).
     * Sin esta columna, cada reenvío disparaba NotificarOrdenCreada de
     * nuevo → el cliente recibía emails y WhatsApps duplicados.
     *
     * Con la columna: el webhook solo dispatcha si está null y, al
     * disparar, la marca con now(). Reenvíos posteriores la detectan
     * seteada y skip.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('mp_notificado_at')->nullable()->after('mp_status_detail');
            $table->index('mp_notificado_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['mp_notificado_at']);
            $table->dropColumn('mp_notificado_at');
        });
    }
};
