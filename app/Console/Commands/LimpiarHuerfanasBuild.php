<?php

namespace App\Console\Commands;

use App\Models\BuildImageUpload;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Limpieza periódica de imágenes del Build que se subieron pero nunca quedaron
 * referenciadas en una config (attached=false) y llevan más del periodo de
 * gracia sin actividad.
 *
 * Programado en routes/console.php para correr a diario.
 */
class LimpiarHuerfanasBuild extends Command
{
    protected $signature   = 'build:limpiar-huerfanas {--dias=2 : Periodo de gracia en días antes de borrar} {--dry-run : Solo muestra qué borraría}';
    protected $description = 'Borra imágenes del Build subidas a S3 que nunca fueron adjuntadas a una config.';

    public function handle(): int
    {
        $dias   = max(1, (int) $this->option('dias'));
        $dryRun = (bool) $this->option('dry-run');

        $huerfanas = BuildImageUpload::where('attached', false)
            ->where('created_at', '<', now()->subDays($dias))
            ->get();

        if ($huerfanas->isEmpty()) {
            $this->info("No hay imágenes huérfanas con más de {$dias} día(s).");
            return self::SUCCESS;
        }

        $this->info("Encontradas {$huerfanas->count()} imágenes huérfanas (>{$dias} día(s)).");

        $borradas = 0;
        foreach ($huerfanas as $imagen) {
            $this->line(" · {$imagen->ruta}");

            if (! $dryRun) {
                Storage::disk('s3')->delete($imagen->ruta);
                $imagen->delete();
                $borradas++;
            }
        }

        $this->newLine();
        if ($dryRun) {
            $this->warn('Dry-run: nada se modificó.');
        } else {
            $this->info("Borradas {$borradas} imágenes huérfanas.");
        }

        return self::SUCCESS;
    }
}
