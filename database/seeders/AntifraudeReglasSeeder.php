<?php

namespace Database\Seeders;

use App\Models\AntifraudeRegla;
use Illuminate\Database\Seeder;

/**
 * Crea las 3 reglas iniciales del motor antifraude. Idempotente:
 * usa updateOrCreate para no duplicar si ya existen.
 */
class AntifraudeReglasSeeder extends Seeder
{
    public function run(): void
    {
        $reglas = [
            [
                'clave'      => 'telefono_invalido',
                'activa'     => true,
                'parametros' => ['usar_mastershop' => true],
            ],
            [
                'clave'      => 'monto_alto',
                'activa'     => true,
                'parametros' => ['umbral' => 400000],
            ],
            [
                'clave'      => 'cliente_blacklist',
                'activa'     => true,
                'parametros' => null,
            ],
        ];

        foreach ($reglas as $regla) {
            AntifraudeRegla::updateOrCreate(
                ['clave' => $regla['clave']],
                ['activa' => $regla['activa'], 'parametros' => $regla['parametros']],
            );
        }
    }
}
