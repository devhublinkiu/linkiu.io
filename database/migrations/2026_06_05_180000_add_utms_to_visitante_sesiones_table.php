<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Atribución por UTMs específicas en visitante_sesiones.
 *
 * Hoy `origen` solo categoriza (facebook / instagram / google / direct / otros).
 * Estas columnas guardan los UTMs originales del primer hit, lo que permite
 * filtrar Funelinks por campaña específica (utm_campaign), creativo (utm_content),
 * etc. — no solo por plataforma.
 *
 * Todos nullables: sesiones pre-deploy quedan con NULL, no se rompen.
 * Indice en (utm_campaign, inicio) para las queries de "porCampana" del funnel.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('visitante_sesiones', function (Blueprint $table) {
            $table->string('utm_source',   100)->nullable()->after('origen');
            $table->string('utm_medium',   100)->nullable()->after('utm_source');
            $table->string('utm_campaign', 100)->nullable()->after('utm_medium');
            $table->string('utm_content',  100)->nullable()->after('utm_campaign');
            $table->string('utm_term',     100)->nullable()->after('utm_content');
            $table->string('landing_path', 200)->nullable()->after('utm_term');

            $table->index(['utm_campaign', 'inicio'], 'visitante_sesiones_utm_campaign_inicio_index');
        });
    }

    public function down(): void
    {
        Schema::table('visitante_sesiones', function (Blueprint $table) {
            $table->dropIndex('visitante_sesiones_utm_campaign_inicio_index');
            $table->dropColumn([
                'utm_source', 'utm_medium', 'utm_campaign',
                'utm_content', 'utm_term', 'landing_path',
            ]);
        });
    }
};
