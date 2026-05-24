<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Reconstruye `password_reset_tokens` con PK compuesta (email, guard)
     * para soportar flujos multi-guard (admin + cliente). Preserva los
     * registros existentes asignándolos a guard 'web' (admin).
     *
     * Tabla recreada (no ALTER PK) para compatibilidad SQLite/MySQL.
     */
    public function up(): void
    {
        $existentes = DB::table('password_reset_tokens')->get();

        Schema::drop('password_reset_tokens');

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email');
            $table->string('guard', 20)->default('web');
            $table->string('token');
            $table->timestamp('created_at')->nullable();
            $table->primary(['email', 'guard']);
        });

        foreach ($existentes as $row) {
            DB::table('password_reset_tokens')->insert([
                'email'      => $row->email,
                'guard'      => 'web',
                'token'      => $row->token,
                'created_at' => $row->created_at,
            ]);
        }
    }

    public function down(): void
    {
        $existentes = DB::table('password_reset_tokens')
            ->where('guard', 'web')
            ->get();

        Schema::drop('password_reset_tokens');

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        foreach ($existentes as $row) {
            DB::table('password_reset_tokens')->insert([
                'email'      => $row->email,
                'token'      => $row->token,
                'created_at' => $row->created_at,
            ]);
        }
    }
};
