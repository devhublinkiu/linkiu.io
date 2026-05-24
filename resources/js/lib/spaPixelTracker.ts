import { router } from '@inertiajs/react'
import { trackFb } from './usePixel'

/**
 * Re-dispara PageView (Meta + Google Ads) en cada navegación SPA de Inertia.
 *
 * El script Meta solo dispara PageView una vez al cargar la app inicial. Sin
 * este tracker, navegar entre páginas con Inertia no genera nuevos eventos →
 * pérdida masiva de datos en Meta Ads Manager.
 *
 * Se ignoran rutas /admin/* para no contaminar las métricas con tráfico interno.
 */
export function bootstrapSpaPixelTracker(): void {
    if (typeof window === 'undefined') return

    router.on('navigate', () => {
        const path = window.location.pathname

        // Excluir admin del tracking.
        if (path.startsWith('/admin/')) return

        trackFb('PageView')

        if (typeof window.gtag === 'function') {
            window.gtag('event', 'page_view', {
                page_path:     path,
                page_location: window.location.href,
            })
        }
    })
}
