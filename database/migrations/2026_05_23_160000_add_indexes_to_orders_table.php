<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Tab admin "Pendientes/Confirmadas/..." + count pendientes.
            $table->index('estado');
            // Búsqueda admin por correo del cliente.
            $table->index('email');
            // Webhook MercadoPago busca orden por payment_id.
            $table->index('mp_payment_id');
            // Order::latest() en index admin.
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['estado']);
            $table->dropIndex(['email']);
            $table->dropIndex(['mp_payment_id']);
            $table->dropIndex(['created_at']);
        });
    }
};
