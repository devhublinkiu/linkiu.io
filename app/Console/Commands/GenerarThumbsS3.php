<?php

namespace App\Console\Commands;

use App\Actions\Build\SubirImagenWebp;
use Aws\Exception\AwsException;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;

/**
 * Genera la versión `_thumb.webp` (200×200) para las imágenes WebP existentes
 * en S3 que aún no la tienen. Los uploads nuevos ya emiten thumb automáticamente
 * vía SubirImagenWebp — este comando sólo cubre el backlog.
 *
 * Idempotente: si una imagen ya tiene su thumb, se saltea. Re-correrlo es
 * seguro.
 */
class GenerarThumbsS3 extends Command
{
    protected $signature = 'linkiu:s3:generar-thumbs
                            {--dry-run : No sube nada, sólo cuenta cuántas se procesarían}
                            {--prefix= : Prefijo opcional (ej: productos)}
                            {--limit=0 : Límite de archivos (0 = todos)}
                            {--force : Regenera el thumb aunque ya exista}';

    protected $description = 'Genera _thumb.webp (200px) para las imágenes WebP existentes en S3';

    public function handle(): int
    {
        /** @var \Illuminate\Filesystem\AwsS3V3Adapter $disk */
        $disk    = Storage::disk('s3');
        $prefix  = (string) $this->option('prefix');
        $limit   = (int)    $this->option('limit');
        $dryRun  = (bool)   $this->option('dry-run');
        $force   = (bool)   $this->option('force');
        $ancho   = SubirImagenWebp::ANCHO_THUMB;

        $this->info('Prefix: ' . ($prefix ?: '(todo)'));
        $this->info("Ancho thumb: {$ancho}px · quality 80");
        $this->info('Modo: ' . ($dryRun ? 'DRY-RUN' : 'APLICAR') . ($force ? ' · FORCE' : ''));
        $this->newLine();

        $todos = $disk->allFiles($prefix);

        // Solo WebP originales (excluye los _thumb.webp para no recursión)
        $originales = array_values(array_filter(
            $todos,
            fn ($f) => str_ends_with(strtolower($f), '.webp') && ! str_ends_with(strtolower($f), '_thumb.webp'),
        ));

        $total = count($originales);
        if ($total === 0) {
            $this->warn('No hay imágenes WebP originales para procesar.');
            return self::SUCCESS;
        }

        // Set de thumbs ya existentes para chequeo O(1)
        $thumbsExistentes = array_flip(array_filter(
            $todos,
            fn ($f) => str_ends_with(strtolower($f), '_thumb.webp'),
        ));

        $maxProc = $limit > 0 ? min($limit, $total) : $total;
        $this->info("Encontrados: {$total} WebP originales (se procesarán hasta {$maxProc})");

        $manager   = new ImageManager(new Driver());
        $generados = 0;
        $existian  = 0;
        $errores   = 0;

        $bar = $this->output->createProgressBar($maxProc);
        $bar->start();

        foreach ($originales as $idx => $original) {
            if ($idx >= $maxProc) break;

            $thumb = preg_replace('/\.webp$/i', '_thumb.webp', $original);

            if (! $force && isset($thumbsExistentes[$thumb])) {
                $existian++;
                $bar->advance();
                continue;
            }

            if ($dryRun) {
                $generados++;
                $bar->advance();
                continue;
            }

            try {
                $contenido = $disk->get($original);
                $thumbBin  = (string) $manager->decode($contenido)
                    ->scaleDown(width: $ancho)
                    ->encode(new WebpEncoder(quality: 80));

                $disk->put($thumb, $thumbBin, [
                    'CacheControl' => 'public, max-age=31536000, immutable',
                    'ContentType'  => 'image/webp',
                ]);
                $generados++;
            } catch (AwsException | \Throwable $e) {
                $errores++;
                $this->newLine();
                $this->warn("✗ {$original}: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✓ Generados:   {$generados}");
        $this->line("· Ya existían: {$existian}");
        if ($errores > 0) {
            $this->error("✗ Errores:     {$errores}");
            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
