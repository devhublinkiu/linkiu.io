<?php

namespace App\Console\Commands;

use App\Models\BuildConfig;
use Illuminate\Console\Command;

/**
 * Comando one-off para "empezar limpio" después de migrar el almacenamiento
 * de imágenes del disco public local al bucket S3 (Fase 3).
 *
 * Las imágenes que el cliente había subido antes viven solo en local; al cambiar
 * el código para resolver contra S3, esas rutas dejan de existir. Este comando
 * vacía las referencias en BuildConfig para que el cliente vuelva a subir todo
 * desde el panel sin que aparezcan placeholders rotos.
 *
 * Ejecutar UNA sola vez tras el deploy de la Fase 3:
 *   php artisan build:limpiar-imagenes
 */
class LimpiarImagenesBuild extends Command
{
    protected $signature   = 'build:limpiar-imagenes {--dry-run : Solo muestra lo que se borraría sin tocar la BD}';
    protected $description = 'Vacía las rutas de imágenes del Build (logos, hero, banners, carrusel, historia) tras migrar a S3.';

    /** Keys cuyo valor completo se debe poner en null (logos). */
    private const KEYS_NULL = [
        'build_logo_tienda',
        'build_logo_admin',
    ];

    /**
     * Configs JSON donde hay que eliminar el sub-campo de imagen.
     * Formato: clave => lista de paths a borrar dentro del JSON decodificado.
     */
    private const KEYS_JSON = [
        'build_inicio_hero_config'        => ['imagenes'],
        'build_inicio_banners_config'     => ['items'],
        'build_inicio_carrusel_config'    => ['items'],
        'build_quienes_historia_config'   => ['imagen_url', 'imagen_ruta'],
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        if ($dryRun) {
            $this->warn('Modo dry-run: no se modificará la base de datos.');
        }

        $this->info('Limpiando logos…');
        foreach (self::KEYS_NULL as $key) {
            $valor = BuildConfig::get($key);
            if ($valor === null) {
                $this->line("  · {$key}: ya estaba vacío.");
                continue;
            }
            $this->line("  · {$key}: {$valor} → null");
            if (! $dryRun) {
                BuildConfig::set($key, null);
            }
        }

        $this->info('Limpiando configs con imágenes…');
        foreach (self::KEYS_JSON as $key => $campos) {
            $raw = BuildConfig::get($key);
            if (! $raw) {
                $this->line("  · {$key}: no hay config guardada.");
                continue;
            }

            $config = json_decode($raw, true);
            if (! is_array($config)) {
                $this->line("  · {$key}: config no parseable, se omite.");
                continue;
            }

            $algo = false;
            foreach ($campos as $campo) {
                if (array_key_exists($campo, $config) && ! empty($config[$campo])) {
                    $this->line("  · {$key}.{$campo}: limpiado");
                    unset($config[$campo]);
                    $algo = true;
                }
            }

            if ($algo && ! $dryRun) {
                BuildConfig::set($key, json_encode($config));
            }
        }

        $this->newLine();
        $this->info($dryRun ? 'Dry-run completo.' : 'Limpieza completa. El cliente debe re-subir las imágenes desde el panel.');

        return self::SUCCESS;
    }
}
