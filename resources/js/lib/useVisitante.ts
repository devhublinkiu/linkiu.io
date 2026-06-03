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
const STORAGE_KEY_ORIGEN  = 'vivo:origen-v2'   // v2 marca el nuevo formato {origen, ts}
const TTL_ORIGEN_MS       = 30 * 24 * 60 * 60 * 1000  // 30 dias

type Origen = 'facebook' | 'instagram' | 'google' | 'direct' | 'otros'
type Dispositivo = 'movil' | 'desktop' | 'tablet'

/**
 * Detecta el origen del visitante con 5 niveles de confianza:
 *  1. UTM source explicito (incluye 'fb', 'ig' que Meta usa con {{site_source_name}}).
 *  2. Click IDs de cada plataforma (fbclid, igshid, gclid, ttclid, msclkid).
 *  3. Referer ampliado (incluye subdominios l/m/lm.facebook.com, fb.me, fbcdn.net,
 *     instagram.com, instagr.am, cdninstagram, google.*).
 *  4. Referer interno (mismo dominio) -> direct.
 *  5. Sin referer -> direct.
 */
function detectarOrigen(): Origen {
    try {
        const params = new URLSearchParams(window.location.search)

        // 1. UTM source — clasificacion amplia
        const utm = (params.get('utm_source') || '').toLowerCase().trim()
        if (utm) {
            if (utm.includes('facebook') || utm === 'fb')  return 'facebook'
            if (utm.includes('instagram') || utm === 'ig') return 'instagram'
            if (utm.includes('google'))                    return 'google'
            return 'otros'
        }

        // 2. Click IDs especificos de cada plataforma
        if (params.has('fbclid'))  return 'facebook'   // Meta (FB + IG)
        if (params.has('igshid'))  return 'instagram'  // Instagram share
        if (params.has('gclid'))   return 'google'     // Google Ads
        if (params.has('ttclid'))  return 'otros'      // TikTok
        if (params.has('msclkid')) return 'otros'      // Microsoft Ads

        // 3. Referer ampliado
        const ref = (document.referrer || '').toLowerCase()
        if (! ref) return 'direct'

        if (ref.match(/(?:^|\.)facebook\.com|fb\.me|fbcdn\.net|l\.facebook|m\.facebook|lm\.facebook/)) return 'facebook'
        if (ref.match(/(?:^|\.)instagram\.com|instagr\.am|cdninstagram/))                              return 'instagram'
        if (ref.match(/(?:^|\.)google\./))                                                              return 'google'

        // 4. Referer del mismo dominio = navegacion interna
        try {
            if (new URL(document.referrer).hostname === window.location.hostname) return 'direct'
        } catch { /* malformed referer */ }

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

/**
 * Persiste el origen en localStorage con TTL 30 dias. Si el visitante
 * vuelve antes de 30 dias sin hacer click en otro anuncio, mantiene su
 * origen original. Despues de 30 dias se re-detecta.
 *
 * Cambio importante vs version anterior: era sessionStorage (1 pestana).
 * Ahora persiste cross-tab y cross-visit pero con expiracion clara.
 */
function leerOrigen(): Origen {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_ORIGEN)
        if (raw) {
            const parsed = JSON.parse(raw) as { origen: Origen; ts: number }
            if (Date.now() - parsed.ts < TTL_ORIGEN_MS) return parsed.origen
        }
    } catch { /* malformed o no disponible */ }

    const detectado = detectarOrigen()
    try {
        localStorage.setItem(STORAGE_KEY_ORIGEN, JSON.stringify({ origen: detectado, ts: Date.now() }))
    } catch { /* localStorage lleno o deshabilitado */ }
    return detectado
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

        // Custom event para reporte manual de seccion desde otras paginas.
        function onSeccion(e: Event) {
            const detail = (e as CustomEvent<{ seccion: string | null }>).detail
            const nueva = detail?.seccion ?? null
            if (nueva === seccionRef.current) return
            seccionRef.current = nueva
            tick()
        }
        window.addEventListener('vivo:seccion', onSeccion)

        // Detector de seccion via IntersectionObserver con permanencia.
        // Una seccion se reporta solo cuando:
        //   1. Ocupa al menos UMBRAL_VISIBLE (50%) del viewport, Y
        //   2. Sigue cumpliendo eso durante TIEMPO_REPORTE (1.5s) continuos.
        // Asi filtra scroll de paso (la persona no llego a leer) y cero
        // consumo de CPU en scroll — el browser optimiza IO nativamente.
        const UMBRAL_VISIBLE = 0.5
        const TIEMPO_REPORTE = 1500
        const timersIO = new Map<string, ReturnType<typeof setTimeout>>()

        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const key = (entry.target as HTMLElement).dataset.hook
                if (! key) return

                if (entry.isIntersecting && entry.intersectionRatio >= UMBRAL_VISIBLE) {
                    if (! timersIO.has(key)) {
                        const t = setTimeout(() => {
                            if (key !== seccionRef.current) {
                                seccionRef.current = key
                                tick()
                            }
                            timersIO.delete(key)
                        }, TIEMPO_REPORTE)
                        timersIO.set(key, t)
                    }
                } else {
                    const t = timersIO.get(key)
                    if (t) { clearTimeout(t); timersIO.delete(key) }
                }
            })
        }, { threshold: [UMBRAL_VISIBLE] })

        document.querySelectorAll<HTMLElement>('[data-hook]').forEach(el => io.observe(el))

        window.addEventListener('beforeunload', desconectar)
        document.addEventListener('visibilitychange', onVisibility)

        return () => {
            clearInterval(timer)
            io.disconnect()
            timersIO.forEach(t => clearTimeout(t))
            timersIO.clear()
            unsubNav()
            window.removeEventListener('vivo:seccion', onSeccion)
            window.removeEventListener('beforeunload', desconectar)
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [])
}

/**
 * Helper para disparar el evento desde componentes que detectan la seccion
 * manualmente (raro — la deteccion automatica via IntersectionObserver
 * cubre el 99% de los casos). Se exporta por si una pagina con un layout
 * inusual necesita reportar a mano.
 */
export function reportarSeccion(seccion: string | null) {
    window.dispatchEvent(new CustomEvent('vivo:seccion', { detail: { seccion } }))
}

