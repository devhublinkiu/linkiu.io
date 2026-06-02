<?php

namespace App\Console\Commands;

use App\Models\BuildConfig;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Recalcula y persiste el ancho/alto del logo_tienda y logo_admin para tenants
 * que ya tenian logo subido antes de que UpdateLogos persistiera dimensiones.
 *
 * Sin estas dimensiones, el frontend no puede setear width/height en el <img>
 * y PageSpeed reporta CLS por reservar mal el espacio del logo.
 *
 * Idempotente: re-correrlo sobre un tenant con dimensiones ya seteadas las
 * sobreescribe con los mismos valores (no hace daño).
 *
 * Uso:
 *   php artisan linkiu:logos:recalcular-dims
 *   php artisan linkiu:logos:recalcular-dims --dry-run
 */
class RecalcularDimensionesLogos extends Command
{
    protected $signature = 'linkiu:logos:recalcular-dims
                            {--dry-run : Solo muestra lo que haria, no toca la base}';

    protected $description = 'Recalcula y persiste el ancho/alto del logo tienda/admin del tenant actual';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');
        $this->info('Modo: ' . ($dry ? 'DRY-RUN' : 'APLICAR'));
        $this->newLine();

        foreach (['tienda', 'admin'] as $slot) {
            $ruta = BuildConfig::get("build_logo_{$slot}");

            if (! $ruta) {
                $this->line("[{$slot}] sin logo configurado — skip");
                continue;
            }

            try {
                $contenido = Storage::disk('s3')->get($ruta);
                if (! $contenido) {
                    $this->warn("[{$slot}] no se pudo leer {$ruta} de S3");
                    continue;
                }

                $info = getimagesizefromstring($contenido);
                if (! $info || ! isset($info[0], $info[1])) {
                    $this->warn("[{$slot}] no se pudieron leer dimensiones de {$ruta}");
                    continue;
                }

                $w = (int) $info[0];
                $h = (int) $info[1];

                $this->info("[{$slot}] {$ruta} → {$w}x{$h}");

                if (! $dry) {
                    BuildConfig::set("build_logo_{$slot}_w", (string) $w);
                    BuildConfig::set("build_logo_{$slot}_h", (string) $h);
                }
            } catch (\Throwable $e) {
                $this->error("[{$slot}] error: " . $e->getMessage());
            }
        }

        return self::SUCCESS;
    }
}
