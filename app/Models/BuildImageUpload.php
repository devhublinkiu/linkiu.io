<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Registro de cada imagen subida desde el módulo Build.
 *
 * attached=false → la imagen está en S3 pero ninguna config la referencia.
 * Tras un periodo de gracia, el comando build:limpiar-huerfanas la borra.
 */
class BuildImageUpload extends Model
{
    protected $fillable = ['ruta', 'carpeta', 'uploaded_by', 'attached'];

    protected $casts = [
        'attached' => 'boolean',
    ];

    /**
     * Registra un nuevo upload, marcado como huérfano hasta que se asocie.
     * Si la ruta ya existe, actualiza el registro existente.
     */
    public static function registrar(string $ruta, ?int $userId = null): self
    {
        return static::updateOrCreate(
            ['ruta' => $ruta],
            [
                'carpeta'     => dirname($ruta),
                'uploaded_by' => $userId,
                'attached'    => false,
            ],
        );
    }

    /**
     * Marca como adjuntas (attached=true) las rutas dadas dentro de la carpeta;
     * todas las demás rutas de la misma carpeta quedan attached=false y serán
     * candidatas a limpieza tras el periodo de gracia.
     */
    public static function attachOnly(string $carpeta, array $rutas): void
    {
        static::where('carpeta', $carpeta)->update(['attached' => false]);

        if (! empty($rutas)) {
            static::where('carpeta', $carpeta)
                ->whereIn('ruta', $rutas)
                ->update(['attached' => true]);
        }
    }

    /**
     * Elimina el registro de tracking de una ruta (cuando el archivo se borra
     * manualmente desde el admin).
     */
    public static function olvidar(string $ruta): void
    {
        static::where('ruta', $ruta)->delete();
    }
}
