<?php

namespace App\Console\Commands;

use Aws\Exception\AwsException;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

/**
 * Recomprime las imágenes existentes en S3 a WebP quality 80 con Cache-Control
 * inmutable. Reemplaza el archivo solo si la nueva versión es más liviana —
 * evita regresiones cuando una imagen ya estaba optimizada.
 *
 * Es seguro re-correrlo: si la imagen ya está optimizada, se queda como está.
 */
class RecomprimirImagenesS3 extends Command
{
    protected $signature = 'linkiu:s3:recomprimir
                            {--dry-run : Solo muestra el ahorro estimado, no toca nada}
                            {--prefix= : Prefijo opcional (ej: productos)}
                            {--limit=0 : Límite de archivos (0 = todos)}
                            {--quality=80 : Calidad WebP de salida (1-100)}
                            {--ancho-max=1600 : Ancho máximo en px — escala hacia abajo si excede}
                            {--min-ahorro=15 : Solo reemplaza si el ahorro es >= N%}';

    protected $description = 'Recomprime imágenes WebP de S3 a calidad 80 + Cache-Control inmutable';

    public function handle(): int
    {
        /** @var \Illuminate\Filesystem\AwsS3V3Adapter $disk */
        $disk    = Storage::disk('s3');
        $bucket  = config('filesystems.disks.s3.bucket');
        $prefix  = (string) $this->option('prefix');
        $limit   = (int)    $this->option('limit');
        $dryRun  = (bool)   $this->option('dry-run');
        $quality = max(1, min(100, (int) $this->option('quality')));
        $ancho   = max(100, (int) $this->option('ancho-max'));
        $minPct  = max(0, (int) $this->option('min-ahorro'));

        $this->info("Bucket: {$bucket} · prefix: " . ($prefix ?: '(todo)'));
        $this->info("Quality: {$quality} · ancho_max: {$ancho}px · min_ahorro: {$minPct}%");
        $this->info('Modo: ' . ($dryRun ? 'DRY-RUN' : 'APLICAR'));
        $this->newLine();

        $files = $disk->allFiles($prefix);
        // Solo WebP (las JPG/PNG existentes son irrelevantes — todo nuevo se sube WebP)
        $files = array_values(array_filter($files, fn ($f) => str_ends_with(strtolower($f), '.webp')));
        $total = count($files);

        if ($total === 0) {
            $this->warn('No hay imágenes WebP para procesar.');
            return self::SUCCESS;
        }

        $maxProc = $limit > 0 ? min($limit, $total) : $total;
        $this->info("Encontrados: {$total} archivos WebP (se procesarán hasta {$maxProc})");

        $manager      = new ImageManager(new Driver());
        $procesados   = 0;
        $reemplazados = 0;
        $sinCambio    = 0;
        $errores      = 0;
        $totalOriginal = 0;
        $totalNuevo    = 0;

        $bar = $this->output->createProgressBar($maxProc);
        $bar->start();

        foreach ($files as $relativePath) {
            if ($procesados >= $maxProc) break;
            $procesados++;

            try {
                $original  = $disk->get($relativePath);
                $bytesOrig = strlen($original);
                $totalOriginal += $bytesOrig;

                $nuevo = (string) $manager->decode($original)
                    ->scaleDown(width: $ancho)
                    ->encode(new WebpEncoder(quality: $quality));

                $bytesNuevo = strlen($nuevo);
                $ahorroPct  = $bytesOrig > 0 ? (1 - $bytesNuevo / $bytesOrig) * 100 : 0;

                if ($ahorroPct < $minPct) {
                    $sinCambio++;
                    $totalNuevo += $bytesOrig; // se queda como está
                    $bar->advance();
                    continue;
                }

                if (! $dryRun) {
                    $disk->put($relativePath, $nuevo, [
                        'CacheControl' => 'public, max-age=31536000, immutable',
                        'ContentType'  => 'image/webp',
                    ]);
                }
                $reemplazados++;
                $totalNuevo += $bytesNuevo;
            } catch (AwsException | \Throwable $e) {
                $errores++;
                $totalNuevo += $bytesOrig; // contamos como sin-cambio
                $this->newLine();
                $this->warn("✗ {$relativePath}: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $ahorroTotal = $totalOriginal - $totalNuevo;
        $ahorroPctT  = $totalOriginal > 0 ? round(($ahorroTotal / $totalOriginal) * 100, 1) : 0;

        $this->info("✓ Procesados:    {$procesados}");
        $this->info("✓ Reemplazados:  {$reemplazados}");
        $this->line("· Sin cambio:    {$sinCambio} (ya estaban optimizadas o ahorro < {$minPct}%)");
        if ($errores > 0) $this->error("✗ Errores:       {$errores}");
        $this->newLine();
        $this->info('Peso original:  ' . $this->humanSize($totalOriginal));
        $this->info('Peso nuevo:     ' . $this->humanSize($totalNuevo));
        $this->info("Ahorro:         {$this->humanSize($ahorroTotal)} ({$ahorroPctT}%)");

        return self::SUCCESS;
    }

    private function humanSize(int $bytes): string
    {
        if ($bytes < 1024) return "{$bytes} B";
        if ($bytes < 1024 * 1024) return round($bytes / 1024, 1) . ' KB';
        return round($bytes / 1024 / 1024, 2) . ' MB';
    }
}
