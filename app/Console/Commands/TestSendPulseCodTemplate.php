<?php

namespace App\Console\Commands;

use App\Services\SendPulseService;
use Illuminate\Console\Command;

/**
 * Dispara la plantilla `order_received_cod_v1` a un teléfono específico con
 * valores ficticios. Sirve para probar el flujo SendPulse → cliente recibe
 * mensaje con botones → presiona → webhook llega a la URL configurada en
 * los flows `order_confirm_cod` / `order_cancel_cod`.
 *
 * Uso:
 *   php artisan sendpulse:test-cod 3233332112
 *   php artisan sendpulse:test-cod 3233332112 --nombre=Carlos --total=150000
 *
 * El teléfono se normaliza a formato Colombia (10 dígitos -> 57 + dígitos).
 */
class TestSendPulseCodTemplate extends Command
{
    protected $signature = 'sendpulse:test-cod
                            {telefono : Número de Colombia de 10 dígitos (3001234567) o con código (573001234567)}
                            {--nombre=Test : Nombre del cliente para la plantilla}
                            {--codigo=LNK-TEST01 : Código de orden ficticio}
                            {--total=89900 : Total en COP (sin separadores)}
                            {--ciudad=Medellín : Ciudad de entrega}';

    protected $description = 'Envía la plantilla order_received_cod_v1 a un teléfono para validar el flujo de botones';

    public function handle(SendPulseService $sendpulse): int
    {
        $telefono = (string) $this->argument('telefono');
        $nombre   = (string) $this->option('nombre');
        $codigo   = (string) $this->option('codigo');
        $total    = (int)    $this->option('total');
        $ciudad   = (string) $this->option('ciudad');

        $this->info("Enviando order_received_cod_v1 a {$telefono} con:");
        $this->line("  nombre:  {$nombre}");
        $this->line("  codigo:  {$codigo}");
        $this->line("  total:   $" . number_format($total, 0, ',', '.'));
        $this->line("  ciudad:  {$ciudad}");
        $this->newLine();

        $ok = $sendpulse->notificarOrdenCreadaCodRaw($telefono, $nombre, $codigo, $total, $ciudad);

        if ($ok) {
            $this->info('✓ Plantilla enviada. Revisá el WhatsApp del destino y presioná un botón.');
            $this->line('  Después mirá webhook.site (la URL que pegaste en los flows) para capturar el JSON.');
            return self::SUCCESS;
        }

        $this->error('✗ Falló el envío. Revisá storage/logs/laravel.log para el detalle del error de SendPulse.');
        return self::FAILURE;
    }
}
