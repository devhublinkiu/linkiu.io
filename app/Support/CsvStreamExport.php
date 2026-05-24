<?php

namespace App\Support;

use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Helper para exportar CSV en streaming, con BOM UTF-8 (para que Excel /
 * Google Sheets detecten el encoding) y `php://output` para no cargar
 * miles de filas en memoria.
 *
 * El caller pasa un closure de produccion que recibe una función
 * `$write(array $row)`. Esto le permite usar `query->chunk(...)`, un
 * generator, o cualquier iteración propia — el helper no impone forma.
 */
class CsvStreamExport
{
    /**
     * @param  string         $filename  Nombre del archivo descargable.
     * @param  array<string>  $headings  Fila de encabezados.
     * @param  callable       $producer  fn(callable $write): void
     */
    public static function stream(string $filename, array $headings, callable $producer): StreamedResponse
    {
        return response()->streamDownload(function () use ($headings, $producer) {
            $handle = fopen('php://output', 'w');

            // BOM UTF-8: hace que Excel abra el archivo con encoding correcto
            // sin necesidad de un wizard de importación.
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, $headings);

            $write = fn (array $row) => fputcsv($handle, $row);

            $producer($write);

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
