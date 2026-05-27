<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class Integracion extends Model
{
    protected $table    = 'integraciones';
    protected $fillable = ['clave', 'valor'];

    /**
     * Claves cuyos valores son secretos sensibles (credenciales de pasarelas,
     * webhook secrets, API keys). Se cifran al persistir con `Crypt::encryptString`
     * (AES-256-CBC con APP_KEY) y se descifran al leer.
     *
     * Lectura tolerante a valores en plain text legacy: si el descifrado
     * falla, retorna el valor tal cual. Permite migración gradual sin
     * downtime — los valores se cifran al próximo save.
     *
     * ⚠️ APP_KEY debe estar respaldada. Si se pierde, los secrets cifrados
     * son irrecuperables (hay que re-ingresar manualmente).
     */
    private const CLAVES_SECRETAS = [
        'mp_access_token_sandbox',
        'mp_access_token_prod',
        'mp_webhook_secret',
        'fb_access_token',
        'bold_identity_key',
        'bold_secret_key',
    ];

    private static function cacheKey(string $clave): string
    {
        return "integracion:{$clave}";
    }

    private static function esSecreta(string $clave): bool
    {
        return in_array($clave, self::CLAVES_SECRETAS, true);
    }

    public static function get(string $clave, ?string $default = null): ?string
    {
        // Wrapper en array para distinguir "no cacheado" de "cacheado como null".
        // Sin esto, Cache::rememberForever recomputa cada vez si el valor es null.
        $envelope = Cache::rememberForever(
            self::cacheKey($clave),
            fn () => ['v' => static::where('clave', $clave)->value('valor')],
        );

        $valor = $envelope['v'] ?? $default;

        if ($valor !== null && self::esSecreta($clave)) {
            try {
                return Crypt::decryptString($valor);
            } catch (DecryptException) {
                // Valor legacy en plain text — devolverlo tal cual.
                // Al próximo save se persistirá cifrado.
                return $valor;
            }
        }

        return $valor;
    }

    public static function set(string $clave, ?string $valor): void
    {
        $valorPersistir = ($valor !== null && self::esSecreta($clave))
            ? Crypt::encryptString($valor)
            : $valor;

        static::updateOrCreate(['clave' => $clave], ['valor' => $valorPersistir]);
        Cache::forget(self::cacheKey($clave));
    }
}
