<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Token aleatorio de 40 chars para URLs públicas (no enumerable).
            // Nullable + unique para soportar backfill de filas existentes sin
            // requerir doctrine/dbal. El modelo lo setea siempre en creating.
            $table->string('acceso_token', 40)->nullable()->unique()->after('codigo');
        });

        // Backfill: cada orden existente recibe un token único.
        DB::table('orders')->whereNull('acceso_token')->orderBy('id')->each(function ($orden) {
            DB::table('orders')
                ->where('id', $orden->id)
                ->update(['acceso_token' => Str::random(40)]);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['acceso_token']);
            $table->dropColumn('acceso_token');
        });
    }
};
