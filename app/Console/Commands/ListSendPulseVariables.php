<?php

namespace App\Console\Commands;

use App\Services\SendPulseService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * Lista las variables del bot WhatsApp en SendPulse y las imprime crudas.
 * Útil para descubrir el `name` y `id` exactos cuando setVariable falla con
 * "Variable does not exist".
 */
class ListSendPulseVariables extends Command
{
    protected $signature = 'sendpulse:list-variables';

    protected $description = 'Lista las variables del bot SendPulse (debug)';

    public function handle(SendPulseService $sendpulse): int
    {
        $clientId     = config('sendpulse.client_id');
        $clientSecret = config('sendpulse.client_secret');
        $botId        = config('sendpulse.bot_id');

        if (! $clientId || ! $clientSecret || ! $botId) {
            $this->error('Faltan credenciales SendPulse en .env');
            return self::FAILURE;
        }

        $tokenRes = Http::post('https://api.sendpulse.com/oauth/access_token', [
            'grant_type'    => 'client_credentials',
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
        ]);

        $token = $tokenRes->json('access_token');
        if (! $token) {
            $this->error('No se pudo obtener access_token');
            return self::FAILURE;
        }

        $this->info("bot_id: {$botId}");
        $this->newLine();

        $res = Http::withToken($token)
            ->get('https://api.sendpulse.com/whatsapp/variables', ['bot_id' => $botId]);

        $this->line('=== STATUS ===');
        $this->line((string) $res->status());
        $this->newLine();

        $this->line('=== RESPONSE BODY ===');
        $this->line(json_encode($res->json(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return self::SUCCESS;
    }
}
