import { useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'

export function useProductTracker(productoId: number | null) {
    const maxScroll  = useRef(0)
    const registrado = useRef(false)

    useEffect(() => {
        if (!productoId) return

        maxScroll.current  = 0
        registrado.current = false

        function onScroll() {
            const el     = document.documentElement
            const pct    = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight || 1)) * 100)
            if (pct > maxScroll.current) maxScroll.current = Math.min(pct, 100)
        }

        function enviar() {
            if (registrado.current) return
            registrado.current = true

            const payload = JSON.stringify({
                producto_id:  productoId,
                scroll_depth: maxScroll.current,
                _token:       (document.cookie.match(/XSRF-TOKEN=([^;]+)/) ?? [])[1] ?? '',
            })

            // sendBeacon es más fiable al navegar / cerrar pestaña
            const enviado = navigator.sendBeacon(
                route('track.product-view'),
                new Blob([payload], { type: 'application/json' }),
            )

            // Fallback fetch si sendBeacon no está disponible o falla
            if (!enviado) {
                fetch(route('track.product-view'), {
                    method:      'POST',
                    headers:     { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) ?? [])[1] ?? '') },
                    body:        payload,
                    keepalive:   true,
                }).catch(() => {})
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true })

        // Envía al navegar dentro de la SPA
        const unsubscribe = router.on('before', enviar)

        // Envía al cerrar/recargar
        window.addEventListener('beforeunload', enviar)
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') enviar()
        })

        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('beforeunload', enviar)
            unsubscribe()
        }
    }, [productoId])
}
