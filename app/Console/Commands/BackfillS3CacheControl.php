<?php

namespace App\Console\Commands;

use Aws\Exception\AwsException;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Aplica Cache-Control: public, max-age=31536000, immutable a las imágenes
 * existentes en S3 mediante CopyObject + MetadataDirective=REPLACE.
 *
 * No descarga ni vuelve a subir el contenido — solo reescribe metadata. Esto
 * resuelve el flag de PageSpeed "sin caché eficiente" sin pagar transferencia.
 *
 * Para recomprimir el contenido (bajar peso), usar linkiu:s3:recomprimir.
 */
class BackfillS3CacheControl extends Command
{
    protected $signature = 'linkiu:s3:backfill-cache
                            {--dry-run : Muestra cuántos archivos se procesarían sin tocar nada}
                            {--prefix= : Prefijo opcional para filtrar (ej: productos)}
                            {--limit=0 : Límite de archivos a procesar (0 = todos)}';

    protected $description = 'Aplica Cache-Control inmutable a imágenes existentes en S3 sin recomprimir';

    public function handle(): int
    {
        /** @var \Illuminate\Filesystem\AwsS3V3Adapter $disk */
        $disk   = Storage::disk('s3');
        $client = $disk->getClient();
        $bucket = config('filesystems.disks.s3.bucket');
        $root   = trim((string) config('filesystems.disks.s3.root', ''), '/');
        $prefix = (string) $this->option('prefix');
        $limit  = (int)    $this->option('limit');
        $dryRun = (bool)   $this->option('dry-run');

        $this->info("Bucket: {$bucket}");
        $this->info('Root:   ' . ($root ?: '(raíz)'));
        $this->info('Prefijo: ' . ($prefix ?: '(todo)'));
        $this->info('Modo:    ' . ($dryRun ? 'DRY-RUN' : 'APLICAR'));
        $this->newLine();

        $files = $disk->allFiles($prefix);
        $total = count($files);
        $this->info("Encontrados: {$total} archivos");

        if ($total === 0) {
            $this->warn('No hay archivos para procesar.');
            return self::SUCCESS;
        }

        $maxProc    = $limit > 0 ? min($limit, $total) : $total;
        $procesados = 0;
        $saltados   = 0;
        $errores    = 0;
        $bar = $this->output->createProgressBar($maxProc);
        $bar->start();

        foreach ($files as $relativePath) {
            if ($limit > 0 && ($procesados + $errores) >= $limit) break;

            if (! preg_match('/\.(webp|jpe?g|png|avif|gif|svg)$/i', $relativePath)) {
                $saltados++;
                continue;
            }

            $fullKey = ltrim(($root ? "{$root}/" : '') . $relativePath, '/');

            if ($dryRun) {
                $procesados++;
                $bar->advance();
                continue;
            }

            try {
                $client->copyObject([
                    'Bucket'            => $bucket,
                    'Key'               => $fullKey,
                    'CopySource'        => $bucket . '/' . str_replace('%2F', '/', rawurlencode($fullKey)),
                    'MetadataDirective' => 'REPLACE',
                    'CacheControl'      => 'public, max-age=31536000, immutable',
                    'ContentType'       => $this->mime($fullKey),
                ]);
                $procesados++;
            } catch (AwsException $e) {
                $errores++;
                $this->newLine();
                $this->warn("✗ {$fullKey}: " . $e->getAwsErrorMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✓ Procesados: {$procesados}");
        $this->line("· No-imágenes saltadas: {$saltados}");
        if ($errores > 0) {
            $this->error("✗ Errores: {$errores}");
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    private function mime(string $key): string
    {
        return match (strtolower(pathinfo($key, PATHINFO_EXTENSION))) {
            'webp'        => 'image/webp',
            'jpg', 'jpeg' => 'image/jpeg',
            'png'         => 'image/png',
            'avif'        => 'image/avif',
            'gif'         => 'image/gif',
            'svg'         => 'image/svg+xml',
            default       => 'application/octet-stream',
        };
    }
}
