<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * Descarga la version mas reciente de GeoLite2-City.mmdb de MaxMind y la
 * guarda en storage/app/geoip/. Requiere MAXMIND_LICENSE_KEY en .env
 * (cuenta gratis en https://www.maxmind.com/en/geolite2/signup).
 *
 * Pensado para correr 1 vez al mes via cron — MaxMind actualiza la BD
 * semanalmente pero mensual es suficiente para Linkiu.
 *
 * Uso:
 *   php artisan linkiu:geoip:actualizar
 */
class ActualizarGeoLite extends Command
{
    protected $signature = 'linkiu:geoip:actualizar';

    protected $description = 'Descarga la version mas reciente de GeoLite2-City.mmdb de MaxMind';

    public function handle(): int
    {
        $licenseKey = env('MAXMIND_LICENSE_KEY');
        if (! $licenseKey) {
            $this->error('Falta MAXMIND_LICENSE_KEY en .env. Crear cuenta gratis en https://www.maxmind.com/en/geolite2/signup');
            return self::FAILURE;
        }

        $url = "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key={$licenseKey}&suffix=tar.gz";

        $this->info('Descargando GeoLite2-City.mmdb...');

        // Descargamos a un tmp .tar.gz, lo extraemos, encontramos el .mmdb dentro
        // y lo movemos a su ubicacion final.
        $tmpDir  = storage_path('app/geoip/_tmp');
        $tmpTar  = $tmpDir . '/geolite2.tar.gz';
        $destino = storage_path('app/geoip/GeoLite2-City.mmdb');

        @mkdir($tmpDir, 0755, true);

        try {
            $res = Http::timeout(120)->sink($tmpTar)->get($url);

            if (! $res->successful()) {
                $this->error("MaxMind respondio {$res->status()}: " . substr($res->body(), 0, 200));
                return self::FAILURE;
            }

            $tamano = filesize($tmpTar);
            $this->info('Descargado: ' . $this->humanSize($tamano));

            // Extraer
            $this->info('Extrayendo...');
            $phar = new \PharData($tmpTar);
            $phar->decompress();      // .tar.gz -> .tar
            $phar = new \PharData(str_replace('.tar.gz', '.tar', $tmpTar));

            // Buscar el .mmdb dentro
            $mmdbEncontrado = null;
            foreach (new \RecursiveIteratorIterator($phar) as $file) {
                if (str_ends_with($file->getFilename(), '.mmdb')) {
                    $mmdbEncontrado = $file->getPathname();
                    break;
                }
            }

            if (! $mmdbEncontrado) {
                $this->error('No se encontro .mmdb dentro del archivo descargado.');
                return self::FAILURE;
            }

            @mkdir(dirname($destino), 0755, true);
            copy($mmdbEncontrado, $destino);

            $this->info('GeoLite2-City.mmdb actualizado: ' . $destino);
            $this->info('Tamano: ' . $this->humanSize(filesize($destino)));

            // Limpieza
            $this->limpiar($tmpDir);

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Error: ' . $e->getMessage());
            $this->limpiar($tmpDir);
            return self::FAILURE;
        }
    }

    private function limpiar(string $dir): void
    {
        if (! is_dir($dir)) return;
        $it = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($it as $file) {
            $file->isDir() ? rmdir($file->getRealPath()) : unlink($file->getRealPath());
        }
        rmdir($dir);
    }

    private function humanSize(int $bytes): string
    {
        if ($bytes < 1024) return "{$bytes} B";
        if ($bytes < 1024 * 1024) return round($bytes / 1024, 1) . ' KB';
        return round($bytes / 1024 / 1024, 1) . ' MB';
    }
}
