import { useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'

/**
 * Centraliza el tracking del visitante en la tienda publica para Vista en Vivo.
 * Manda heartbeat cada 30s con todos los metadatos del recorrido:
 *  - origen (facebook / instagram / google / direct / otros)
 *  - dispositivo (movil / desktop / tablet)
 *  - pagina actual (refresca en cada navegacion SPA)
 *  - seccion (opcional — Product.tsx la setea con IntersectionObserver)
 *  - iniciado_en (timestamp del primer hit)
 *
 * Disconnect via sendBeacon en visibilitychange=hidden y beforeunload.
 */

const SESSION_KEY_INICIO  = 'vivo:iniciado_en'
const SESSION_KEY_ORIGEN  = 'vivo:origen'
const SESSION_KEY_SECCION = 'vivo:seccion'

type Origen = 'facebook' | 'instagram' | 'google' | 'direct' | 'otros'
type Dispositivo = 'movil' | 'desktop' | 'tablet'

function detectarOrigen(): Origen {
    try {
        const params = new URLSearchParams(window.location.search)
        const utmSource = (params.get('utm_source') || '').toLowerCase()

        if (utmSource.includes('facebook') || utmSource === 'fb')  return 'facebook'
        if (utmSource.includes('instagram') || utmSource === 'ig') return 'instagram'
        if (utmSource.includes('google'))                          return 'google'
        if (utmSource)                                             return 'otros'

        const ref = (document.referrer || '').toLowerCase()
        if (! ref)                                                 return 'direct'
        if (ref.includes('facebook.com') || ref.includes('fb.me')) return 'facebook'
        if (ref.includes('instagram.com'))                         return 'instagram'
        if (ref.includes('google.'))                               return 'google'

        // Si el referer es del mismo dominio, lo consideramos navegacion interna -> direct.
        try {
            const refHost  = new URL(document.referrer).hostname
            const propHost = window.location.hostname
            if (refHost === propHost) return 'direct'
        } catch { /* referer invalido */ }

        return 'otros'
    } catch {
        return 'otros'
    }
}

function detectarDispositivo(): Dispositivo {
    if (typeof window === 'undefined') return 'desktop'
    const w = window.innerWidth
    if (w < 768)  return 'movil'
    if (w < 1024) return 'tablet'
    return 'desktop'
}

function leerInicio(): number {
    try {
        const cached = sessionStorage.getItem(SESSION_KEY_INICIO)
        if (cached) return Number(cached)
        const ahora = Math.floor(Date.now() / 1000)
        sessionStorage.setItem(SESSION_KEY_INICIO, String(ahora))
        return ahora
    } catch {
        return Math.floor(Date.now() / 1000)
    }
}

function leerOrigen(): Origen {
    try {
        const cached = sessionStorage.getItem(SESSION_KEY_ORIGEN) as Origen | null
        if (cached) return cached
        const detectado = detectarOrigen()
        sessionStorage.setItem(SESSION_KEY_ORIGEN, detectado)
        return detectado
    } catch {
        return detectarOrigen()
    }
}

export function useVisitante() {
    const seccionRef = useRef<string | null>(null)

    useEffect(() => {
        function obtenerCsrf() {
            return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
        }

        function payload() {
            return {
                pagina:      window.location.pathname,
                seccion:     seccionRef.current,
                dispositivo: detectarDispositivo(),
                origen:      leerOrigen(),
                iniciado_en: leerInicio(),
                _token:      obtenerCsrf(),
            }
        }

        function tick() {
            if (document.visibilityState !== 'visible') return
            fetch('/api/heartbeat', {
                method:    'POST',
                headers:   { 'X-CSRF-TOKEN': obtenerCsrf(), 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body:      JSON.stringify(payload()),
                keepalive: true,
            }).catch(() => {})
        }

        function desconectar() {
            const url  = '/api/heartbeat/disconnect'
            const blob = new Blob([JSON.stringify({ _token: obtenerCsrf() })], { type: 'application/json' })
            const enviado = navigator.sendBeacon(url, blob)
            if (! enviado) {
                fetch(url, {
                    method:    'POST',
                    headers:   { 'X-CSRF-TOKEN': obtenerCsrf(), 'Accept': 'application/json' },
                    keepalive: true,
                }).catch(() => {})
            }
        }

        function onVisibility() {
            if (document.visibilityState === 'hidden') desconectar()
            else tick()
        }

        // Heartbeat al cargar + cada 30s + en cada navegacion SPA de Inertia.
        tick()
        const timer = setInterval(tick, 30_000)

        // Inertia 'success' se dispara cuando una navegacion SPA termina.
        const unsubNav = router.on('success', () => {
            // Al navegar a otra pagina, la seccion previa ya no aplica.
            seccionRef.current = null
            tick()
        })

        // Custom event que cualquier componente puede disparar para reportar
        // la seccion actual (ej. Product.tsx con IntersectionObserver).
        function onSeccion(e: Event) {
            const detail = (e as CustomEvent<{ seccion: string | null }>).detail
            const nueva = detail?.seccion ?? null
            if (nueva === seccionRef.current) return
            seccionRef.current = nueva
            tick()  // heartbeat inmediato con la nueva seccion
        }
        window.addEventListener('vivo:seccion', onSeccion)

        window.addEventListener('beforeunload', desconectar)
        document.addEventListener('visibilitychange', onVisibility)

        return () => {
            clearInterval(timer)
            unsubNav()
            window.removeEventListener('vivo:seccion', onSeccion)
            window.removeEventListener('beforeunload', desconectar)
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [])
}

/**
 * Helper para disparar el evento desde componentes que detectan la seccion
 * (ej. Product.tsx con IntersectionObserver).
 */
export function reportarSeccion(seccion: string | null) {
    window.dispatchEvent(new CustomEvent('vivo:seccion', { detail: { seccion } }))
}
