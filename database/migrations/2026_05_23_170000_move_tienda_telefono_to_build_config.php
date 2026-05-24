<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Migra `tienda_telefono` desde `integraciones` a `build_configs` como
     * `build_seo_telefono_tienda`. Se considera un dato de identidad de la
     * tienda (igual que el nombre), no una credencial de integración.
     *
     * No borra el registro viejo en integraciones por compatibilidad
     * defensiva con código que pueda quedar leyendo de allí en el deploy.
     * La limpieza se hace en una migración posterior cuando se confirme
     * que ningún consumer lee de `Integracion::get('tienda_telefono')`.
     */
    public function up(): void
    {
        $telefono = DB::table('integraciones')
            ->where('clave', 'tienda_telefono')
            ->value('valor');

        if ($telefono) {
            DB::table('build_configs')->updateOrInsert(
                ['key' => 'build_seo_telefono_tienda'],
                ['value' => $telefono, 'updated_at' => now(), 'created_at' => now()],
            );
        }
    }

    public function down(): void
    {
        DB::table('build_configs')->where('key', 'build_seo_telefono_tienda')->delete();
    }
};
