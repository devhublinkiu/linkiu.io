<?php

namespace App\Actions\Productos;

use App\Models\BuildImageUpload;
use App\Models\Producto;
use App\Models\ProductoHook;
use App\Support\Productos\HookConfigValidator;

class SaveProductoHookConfig
{
    public function __construct(
        private readonly HookConfigValidator $validador,
    ) {}

    /**
     * Valida el config contra las reglas del hook antes de persistir.
     * Lanza ValidationException (HTTP 422) si los datos son inválidos.
     *
     * Una sola query updateOrCreate. Preserva el orden si el hook ya
     * existía (no reasignar posición al re-guardar config).
     *
     * Si el hook maneja imágenes, sincroniza el flag `attached` en
     * `build_image_uploads` para que el cron LimpiarHuerfanasBuild
     * borre solo las imágenes realmente descartadas.
     */
    public function execute(string $hookKey, array $config, Producto $producto): ProductoHook
    {
        $configSanitizado = $this->validador->validar($hookKey, $config);
        $existente        = $producto->hooks()->where('hook_key', $hookKey)->first();

        $hook = $producto->hooks()->updateOrCreate(
            ['hook_key' => $hookKey],
            [
                'config' => $configSanitizado,
                'activo' => true,
                'orden'  => $existente?->orden ?? ($producto->hooks()->max('orden') + 1),
            ],
        );

        $this->sincronizarTrackingImagenes(
            $hookKey,
            rutasViejas: $existente?->config ?? [],
            rutasNuevas: $configSanitizado,
        );

        return $hook;
    }

    /**
     * Marca como attached las rutas que entraron al config y como
     * "huérfana candidata" (attached=false) las que salieron. El cron
     * recoge las huérfanas con >24h y las borra de S3.
     */
    private function sincronizarTrackingImagenes(string $hookKey, array $rutasViejas, array $rutasNuevas): void
    {
        $rutasNuevas = $this->extraerRutas($hookKey, $rutasNuevas);
        $rutasViejas = $this->extraerRutas($hookKey, $rutasViejas);

        $removidas = array_diff($rutasViejas, $rutasNuevas);

        if (! empty($rutasNuevas)) {
            BuildImageUpload::whereIn('ruta', $rutasNuevas)->update(['attached' => true]);
        }

        if (! empty($removidas)) {
            BuildImageUpload::whereIn('ruta', $removidas)->update(['attached' => false]);
        }
    }

    /**
     * Extrae las rutas S3 de imágenes del config según el shape del hook.
     * Solo 3 hooks tienen imágenes: slider, galeria y comparacion visual.
     */
    private function extraerRutas(string $hookKey, array $config): array
    {
        return match ($hookKey) {
            'slider_imagenes', 'galeria_resultados' => array_filter(
                array_map(fn ($img) => $img['ruta'] ?? null, $config['imagenes'] ?? [])
            ),
            'comparacion_visual' => array_filter([
                $config['imagen_antes']['ruta']   ?? null,
                $config['imagen_despues']['ruta'] ?? null,
            ]),
            default => [],
        };
    }
}
