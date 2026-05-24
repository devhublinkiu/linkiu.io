<?php

namespace App\Actions\MetodosPago;

use App\Models\MetodoPago;

class UpdateMetodoPagoConfig
{
    /**
     * Persiste la config del método. Sanitiza `instrucciones` con strip_tags
     * porque ese campo se renderiza al cliente público en el checkout — sin
     * sanitizar, un admin malicioso (o cuenta comprometida) podría inyectar
     * <script> que ejecutaría en la sesión del comprador.
     */
    public function handle(MetodoPago $metodo, array $config): void
    {
        if (array_key_exists('instrucciones', $config) && $config['instrucciones'] !== null) {
            $config['instrucciones'] = $this->sanitizarInstrucciones((string) $config['instrucciones']);
        }

        $metodo->update(['config' => $config ?: null]);
    }

    /**
     * Sanitiza texto que se renderiza al cliente público. Dos pasos:
     *  1. Elimina contenido COMPLETO de <script> y <style> (incluye el
     *     texto entre tags — `strip_tags` solo, dejaría 'alert(1)' como
     *     texto residual de un <script>alert(1)</script>).
     *  2. `strip_tags` quita el resto de tags HTML (<b>, <a>, <br>, etc.)
     *     dejando solo el texto plano.
     */
    private function sanitizarInstrucciones(string $texto): ?string
    {
        $sinScripts = preg_replace('#<(script|style)\b[^>]*>.*?</\1>#si', '', $texto) ?? '';
        $textoLimpio = trim(strip_tags($sinScripts));

        return $textoLimpio !== '' ? $textoLimpio : null;
    }
}
