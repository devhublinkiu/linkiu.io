<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\ClienteBlacklist;
use App\Models\Order;
use App\Services\AntifraudeService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Crea órdenes ficticias para validar el flujo Capa 2 Antifraude.
 *
 * Bypassea CrearOrden::execute (que requiere zona de envío configurada y
 * dispara WhatsApp) — usa Order::create directo y luego ejecuta el motor
 * antifraude manualmente. Es suficiente para validar:
 *   - Las 3 reglas (telefono, monto, blacklist)
 *   - El marcado de revision_estado / revision_motivos
 *   - La UI (Index con tab Revisión + badges, Show con card y bloqueo)
 *
 * Para validación end-to-end del hook en CrearOrden, hacer un checkout real.
 *
 * Las órdenes creadas se identifican por notas_internas con marker `[TEST_AF]`
 * para poder limpiarlas con --limpiar.
 */
class TestAntifraude extends Command
{
    private const MARKER = '[TEST_AF]';

    protected $signature = 'antifraude:test
                            {regla=todas : Cuál disparar — telefono | monto | blacklist | todas}
                            {--limpiar : Borra todas las órdenes y entradas blacklist de test (sufijo [TEST_AF])}';

    protected $description = 'Crea órdenes ficticias para probar el flujo antifraude (Capa 2)';

    public function handle(AntifraudeService $antifraude): int
    {
        if ($this->option('limpiar')) {
            return $this->limpiar();
        }

        $regla = $this->argument('regla');

        $reglas = match ($regla) {
            'todas'     => ['telefono', 'monto', 'blacklist'],
            'telefono', 'monto', 'blacklist' => [$regla],
            default => null,
        };

        if ($reglas === null) {
            $this->error("Regla desconocida: {$regla}");
            $this->line('Opciones válidas: telefono | monto | blacklist | todas');
            return self::FAILURE;
        }

        $creadas = [];
        foreach ($reglas as $r) {
            $orden = match ($r) {
                'telefono'  => $this->crearOrdenTelefonoInvalido(),
                'monto'     => $this->crearOrdenMontoAlto(),
                'blacklist' => $this->crearOrdenBlacklist(),
            };

            // Evaluar con el motor real — esto setea revision_estado igual que
            // lo haría el hook de CrearOrden en producción.
            $motivos = $antifraude->evaluar($orden);
            if (! empty($motivos)) {
                $orden->update([
                    'revision_estado'  => 'pendiente',
                    'revision_motivos' => $motivos,
                ]);
                $orden->refresh();
            }

            $creadas[] = $orden;
            $this->line("✓ Creada {$orden->codigo} ({$r}) — motivos: " . (
                ! empty($motivos) ? implode(', ', $motivos) : 'ninguno ⚠'
            ));
        }

        $this->newLine();
        $this->info(count($creadas) . ' orden(es) de prueba creada(s).');
        $this->newLine();
        $this->line('Revisalas en:');
        $this->line('  ' . url('/admin/ordenes?revision=pendiente'));
        $this->newLine();
        $this->line('Para limpiarlas: php artisan antifraude:test --limpiar');

        return self::SUCCESS;
    }

    private function crearOrdenTelefonoInvalido(): Order
    {
        $cliente = $this->resolverCliente('test+telefono@linkiu.io', 'Test', 'Telefono', '1234567890');

        return $this->crearOrden([
            'client_id' => $cliente->id,
            'nombre'    => 'Test',
            'apellido'  => 'Telefono Inválido',
            'email'     => 'test+telefono@linkiu.io',
            'telefono'  => '1234567890', // No arranca con 3 → regla regex falla
            'subtotal'  => 80000,
            'total'     => 80000,
        ]);
    }

    private function crearOrdenMontoAlto(): Order
    {
        $cliente = $this->resolverCliente('test+monto@linkiu.io', 'Test', 'Monto', '3009876543');

        return $this->crearOrden([
            'client_id' => $cliente->id,
            'nombre'    => 'Test',
            'apellido'  => 'Monto Alto',
            'email'     => 'test+monto@linkiu.io',
            'telefono'  => '3009876543',  // válido
            'subtotal'  => 500000,        // > 400.000 (umbral default)
            'total'     => 500000,
        ]);
    }

    private function crearOrdenBlacklist(): Order
    {
        // Agregamos el email a la blacklist (idempotente con firstOrCreate)
        ClienteBlacklist::firstOrCreate(
            ['tipo' => 'email', 'valor' => 'test+blacklist@linkiu.io'],
            ['motivo' => 'Test antifraude ' . self::MARKER, 'created_by' => null],
        );

        $cliente = $this->resolverCliente('test+blacklist@linkiu.io', 'Test', 'Blacklist', '3015551234');

        return $this->crearOrden([
            'client_id' => $cliente->id,
            'nombre'    => 'Test',
            'apellido'  => 'Blacklist',
            'email'     => 'test+blacklist@linkiu.io',
            'telefono'  => '3015551234',
            'subtotal'  => 80000,
            'total'     => 80000,
        ]);
    }

    /**
     * Crea una orden con datos por defecto + overrides + 1 item de prueba.
     * Bypassea CrearOrden — escribimos directo en BD dentro de transacción.
     */
    private function crearOrden(array $overrides): Order
    {
        return DB::transaction(function () use ($overrides) {
            $datos = array_merge([
                'estado'         => 'pendiente',
                'metodo_pago'    => 'contraentrega',
                'subtotal'       => 80000,
                'costo_envio'    => 0,
                'recargo'        => 0,
                'total'          => 80000,
                'departamento'   => 'Cundinamarca',
                'ciudad'         => 'Bogotá D.C.',
                'direccion'      => 'Calle 100 # 11-22',
                'apartamento'    => null,
                'notas'          => null,
                'notas_internas' => self::MARKER . ' Orden ficticia para probar el motor antifraude.',
            ], $overrides);

            $orden = Order::create($datos);

            // 1 item ficticio — producto_id null porque es de test
            $orden->items()->create([
                'producto_id'     => null,
                'producto_nombre' => 'Producto de prueba',
                'producto_imagen' => null,
                'label'           => null,
                'cantidad'        => 1,
                'precio_unitario' => $orden->subtotal,
            ]);

            return $orden->fresh();
        });
    }

    private function resolverCliente(string $email, string $nombre, string $apellido, string $telefono): Client
    {
        return Client::updateOrCreate(
            ['email' => $email],
            ['nombre' => $nombre, 'apellido' => $apellido, 'telefono' => $telefono],
        );
    }

    private function limpiar(): int
    {
        $ordenes = Order::where('notas_internas', 'like', self::MARKER . '%')->get();
        $count   = $ordenes->count();

        foreach ($ordenes as $orden) {
            $orden->items()->delete();
            $orden->delete();
        }

        $blEliminados = ClienteBlacklist::where('motivo', 'like', '%' . self::MARKER . '%')->delete();

        // Borramos los clientes test+*@linkiu.io que quedaron huérfanos
        $clientesEliminados = Client::where('email', 'like', 'test+%@linkiu.io')->delete();

        $this->info("✓ Borradas {$count} órdenes de test");
        $this->line("  · {$blEliminados} entradas blacklist de test eliminadas");
        $this->line("  · {$clientesEliminados} clientes de test eliminados");

        return self::SUCCESS;
    }
}
