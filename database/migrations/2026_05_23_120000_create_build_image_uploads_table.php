<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('build_image_uploads', function (Blueprint $table) {
            $table->id();
            $table->string('ruta')->unique();
            $table->string('carpeta');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('attached')->default(false);
            $table->timestamps();

            $table->index(['carpeta', 'attached']);
            $table->index(['attached', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('build_image_uploads');
    }
};
