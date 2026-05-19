<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('mp_payment_id')->nullable()->after('metodo_pago');
            $table->string('mp_status')->nullable()->after('mp_payment_id');
            $table->string('mp_status_detail')->nullable()->after('mp_status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['mp_payment_id', 'mp_status', 'mp_status_detail']);
        });
    }
};
