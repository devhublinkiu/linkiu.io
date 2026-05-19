<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->nullable()->after('name');
            $table->enum('gender', ['masculino', 'femenino', 'prefiero_no_decir'])->nullable()->after('phone');
            $table->date('birthdate')->nullable()->after('gender');
            $table->string('country')->nullable()->after('birthdate');
            $table->string('department')->nullable()->after('country');
            $table->string('city')->nullable()->after('department');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'gender', 'birthdate', 'country', 'department', 'city']);
        });
    }
};
