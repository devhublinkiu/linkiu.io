<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Diagnostico rapido de una orden por telefono o codigo — muestra estado,
 * revision antifraude, confirmacion COD, ultimo job y backlog del queue.
 *
 * Uso:
 *   php artisan linkiu:debug-orden 3113782556
 *   php artisan linkiu:debug-orden NAT-1234
 */
class DebugOrden extends Command
{
    protected $signature = 'linkiu:debug-orden {identificador}';

    protected $description = 'Muestra el estado de una orden + queue para diagnostico';

    public function handle(): int
    {
        $id = $this->argument('identificador');

        $orden = Order::query()
            ->where('telefono', $id)
            ->orWhere('codigo', $id)
            ->latest('id')
            ->first();

        if (! $orden) {
            $this->error("No se encontro orden para: {$id}");
            return self::FAILURE;
        }

        $this->info('=== ORDEN ===');
        $this->line("Codigo:        {$orden->codigo}");
        $this->line("Cliente:       {$orden->nombre} {$orden->apellido}");
        $this->line("Telefono:      {$orden->telefono}");
        $this->line("Ciudad:        {$orden->ciudad}");
        $this->line("Metodo pago:   {$orden->metodo_pago}");
        $this->line("Estado:        {$orden->estado}");
        $this->line("Total:         {$orden->total}");
        $this->line("Creada:        {$orden->created_at}");
        $this->newLine();

        $this->info('=== ANTIFRAUDE ===');
        $this->line('Revision estado:    ' . ($orden->revision_estado ?? 'null (no marcada)'));
        $this->line('Motivos:            ' . json_encode($orden->revision_motivos));
        $this->newLine();

        $this->info('=== CONFIRMACION COD ===');
        $this->line('Solicitada:    ' . ($orden->confirmacion_solicitada_at ?? 'NO se solicito (no se mando plantilla)'));
        $this->line('Reenviada:     ' . ($orden->confirmacion_reenviada ? 'SI' : 'NO'));
        $this->line('Respondida:    ' . ($orden->confirmacion_respondida_at ?? '-'));
        $this->line('Respuesta:     ' . ($orden->confirmacion_respuesta ?? '-'));
        $this->newLine();

        $this->info('=== QUEUE ===');
        $jobs       = DB::table('jobs')->count();
        $failedJobs = DB::table('failed_jobs')->count();
        $this->line("Jobs pendientes:   {$jobs}");
        $this->line("Jobs fallidos:     {$failedJobs}");

        if ($failedJobs > 0) {
            $this->newLine();
            $this->info('=== ULTIMOS 3 JOBS FALLIDOS ===');
            $ultimos = DB::table('failed_jobs')
                ->orderByDesc('id')
                ->limit(3)
                ->get(['id', 'connection', 'queue', 'failed_at', 'exception']);
            foreach ($ultimos as $j) {
                $msg = substr((string) $j->exception, 0, 200);
                $this->line("[{$j->id}] {$j->failed_at} — {$msg}");
            }
        }

        return self::SUCCESS;
    }
}
