import { useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'

const SESION_MIN_MS    = 30 * 60 * 1000  // 30min — ventana de dedup por sesion
const TIEMPO_MINIMO_MS = 3000             // 3s — debajo se considera rebote
const SCROLL_MINIMO    = 5                // 5% — debajo se considera no-interaccion

/**
 * Registra "vistas reales" — filtra refrescos, rebotes y bouncers.
 *
 * Una visita cuenta solo si:
 *   a) No hubo otra del mismo producto en los ultimos 30min (sesion local).
 *   b) El usuario estuvo >=3s en la pagina.
 *   c) Llegamos a >=5% de scroll (algo de interaccion real).
 *
 * El filtro de bots vive en backend (User-Agent) — los bots no van a llegar
 * aca normalmente porque no ejecutan JS, pero por si acaso.
 */
export function useProductTracker(productoId: number | null) {
    const maxScroll  = useRef(0)
    const registrado = useRef(false)
    const inicioMs   = useRef(0)

    useEffect(() => {
        if (!productoId) return

        maxScroll.current  = 0
        registrado.current = false
        inicioMs.current   = Date.now()

        const claveStorage = `pv:${productoId}`

        function onScroll() {
            const el     = document.documentElement
            const pct    = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight || 1)) * 100)
            if (pct > maxScroll.current) maxScroll.current = Math.min(pct, 100)
        }

        function debeEnviar(): boolean {
            // a) Dedup por sesion — mismo producto contado hace <30min
            try {
                const ultimo = localStorage.getItem(claveStorage)
                if (ultimo && Date.now() - Number(ultimo) < SESION_MIN_MS) return false
            } catch {
                // localStorage no disponible (modo privado antiguo, cuota llena) — seguimos
            }

            // b) Tiempo minimo de visita — rebotes no cuentan
            if (Date.now() - inicioMs.current < TIEMPO_MINIMO_MS) return false

            // c) Scroll minimo — quien no scrolleo no interactuo
            if (maxScroll.current < SCROLL_MINIMO) return false

            return true
        }

        function enviar() {
            if (registrado.current) return
            registrado.current = true

            if (!debeEnviar()) return

            try {
                localStorage.setItem(claveStorage, String(Date.now()))
            } catch {
                // ignorar — el dedup es best-effort
            }

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
