<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->enum('estado', ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado'])->default('pendiente');
            $table->string('metodo_pago');
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('costo_envio')->default(0);
            $table->unsignedInteger('recargo')->default(0);
            $table->unsignedInteger('total');
            // Datos de envío (snapshot al momento del pedido)
            $table->string('nombre');
            $table->string('apellido');
            $table->string('email');
            $table->string('telefono');
            $table->string('departamento');
            $table->string('ciudad');
            $table->string('direccion');
            $table->string('apartamento')->nullable();
            $table->text('notas')->nullable();
            $table->string('comprobante_path')->nullable();
            $table->text('notas_internas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
