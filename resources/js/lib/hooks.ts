import { router } from '@inertiajs/react'

/**
 * Límites de validación de configs de hooks. Espejo de las constantes
 * `MAX_*` en `App\Support\Productos\HookConfigValidator`.
 *
 * ⚠️ Mantener sincronizado con el backend: si cambias un valor aquí,
 * actualízalo también en `HookConfigValidator::REGLAS`. Y al revés. El
 * backend es source of truth — frontend valida en UI por UX, pero el
 * 422 final viene del backend si alguien bypassa.
 */
export const HOOK_LIMITS = {
    QUE_INCLUYE_ITEMS:    8,   // HookConfigValidator::MAX_QUE_INCLUYE_ITEMS
    SELLOS_CONFIANZA:     3,   // HookConfigValidator::MAX_SELLOS_CONFIANZA
    GANCHO_STATS:         3,   // HookConfigValidator::MAX_GANCHO_STATS
    SLIDER_IMAGENES:      8,   // HookConfigValidator::MAX_SLIDER_IMAGENES
    TABLA_FILAS:          6,   // HookConfigValidator::MAX_TABLA_FILAS
    CARACTERISTICAS:      4,   // HookConfigValidator::MAX_CARACTERISTICAS
    COMO_FUNCIONA_PASOS:  4,   // HookConfigValidator::MAX_COMO_FUNCIONA_PASOS
    RESENAS:              15,  // HookConfigValidator::MAX_RESENAS
    GALERIA_IMAGENES:     10,  // HookConfigValidator::MAX_GALERIA_IMAGENES
    RESENAS_IMAGEN:       10,  // HookConfigValidator::MAX_RESENAS_IMAGEN
    FAQ:                  10,  // HookConfigValidator::MAX_FAQ
} as const

interface PostHookConfigArgs {
    productoId:  number
    hookKey:     string
    config:      Record<string, unknown>
    onSuccess?:  () => void
    onError?:    (errors: Record<string, string>) => void
    onFinish?:   () => void
}

/**
 * POST al endpoint `admin.productos.hooks.config` para guardar la
 * configuración de un hook. Centraliza el cast `as any` (que Inertia
 * router exige para payloads que no son string keys puras) y los
 * options comunes (`preserveScroll: true`).
 *
 * Los callbacks `onSuccess/onError/onFinish` son opcionales — el caller
 * decide qué hacer en cada caso.
 *
 * El mensaje de éxito viene del backend vía `flash.status` y se muestra
 * desde TabLinkiuHooks con `useEffect`, así que no es necesario un
 * toast.success() en `onSuccess` (solo cierra el modal típicamente).
 */
export function postHookConfig({
    productoId, hookKey, config, onSuccess, onError, onFinish,
}: PostHookConfigArgs): void {
    router.post(
        route('admin.productos.hooks.config', { producto: productoId, hook: hookKey }),
        { config } as Parameters<typeof router.post>[1],
        {
            preserveScroll: true,
            onSuccess,
            onError,
            onFinish,
        },
    )
}
