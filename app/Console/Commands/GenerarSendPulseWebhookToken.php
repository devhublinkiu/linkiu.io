<?php

namespace App\Console\Commands;

use App\Models\Integracion;
use App\Services\SendPulseService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

/**
 * Genera (o regenera) el token aleatorio que valida los POSTs entrantes al
 * webhook de SendPulse. Imprime la URL completa que hay que pegar en SendPulse.
 *
 * Uso:
 *   php artisan sendpulse:webhook-token         # muestra el actual o genera uno si no existe
 *   php artisan sendpulse:webhook-token --rotar # genera uno nuevo (invalida el anterior)
 */
class GenerarSendPulseWebhookToken extends Command
{
    protected $signature = 'sendpulse:webhook-token
                            {--rotar : Genera un token nuevo aunque ya exista uno configurado}';

    protected $description = 'Muestra o genera el token del webhook SendPulse (botones Quick Reply COD)';

    public function handle(): int
    {
        $tokenActual = Integracion::get('sendpulse_webhook_token');
        $rotar       = (bool) $this->option('rotar');

        if ($tokenActual && ! $rotar) {
            $this->info('Token ya configurado.');
            $this->mostrarUrl($tokenActual);
            $this->line('  (Usá --rotar para generar uno nuevo si éste se filtró.)');
            return self::SUCCESS;
        }

        $nuevo = Str::random(40);
        Integracion::set('sendpulse_webhook_token', $nuevo);

        $this->info($rotar ? '✓ Token rotado.' : '✓ Token generado.');
        $this->mostrarUrl($nuevo);
        $this->newLine();
        $this->line('Pegá esa URL en los 2 flows de SendPulse');
        $this->line('(order_confirm_cod y order_cancel_cod).');

        return self::SUCCESS;
    }

    private function mostrarUrl(string $token): void
    {
        $url  = url('/webhooks/sendpulse') . '?token=' . $token;
        $slug = SendPulseService::tagSlugDelHost();

        $this->newLine();
        $this->line('URL del webhook (esta tienda):');
        $this->line('  ' . $url);

        $this->newLine();
        $this->line('Slug del tag (para mapping del router central):');
        $this->line('  ' . $slug);

        $this->newLine();
        $this->line('Línea para agregar al `mappings.php` del router en linkiu.com.co:');
        $this->line("  '{$slug}' => '{$url}',");
    }
}
