declare global {
    interface Window {
        fbq:  (...args: unknown[]) => void
        _fbq: unknown
        gtag: (...args: unknown[]) => void
    }
}

export interface PixelEvent {
    platform:  'fb' | 'google'
    event:     string
    data:      Record<string, unknown>
    timestamp: Date
}

function emit(detail: PixelEvent) {
    window.dispatchEvent(new CustomEvent('pixel:event', { detail }))
}

/**
 * Genera un event_id UUID v4 — el mismo se manda a Pixel y a CAPI.
 * Meta deduplica con esta clave en ventana de 48h.
 */
function nuevoEventId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    // Fallback navegadores viejos.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

export interface MetaUserData {
    email?:       string
    phone?:       string
    first_name?:  string
    last_name?:   string
    external_id?: string
}

/**
 * Lee la cookie CSRF que Laravel pone (XSRF-TOKEN).
 */
function csrfToken(): string {
    if (typeof document === 'undefined') return ''
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : ''
}

/**
 * Manda el mismo evento a Pixel (browser) y a Conversions API (server).
 *
 * - Pixel: dispara fbq con `{ eventID }` para que Meta deduplique
 * - CAPI: POST a /api/meta/event con el mismo event_id
 *
 * Si el endpoint server falla o no hay Pixel ID configurado, el Pixel
 * sigue funcionando y al revés. Tolerancia a fallos en ambas vías.
 */
export function trackFb(event: string, data: Record<string, unknown> = {}, userData?: MetaUserData) {
    if (typeof window === 'undefined') return

    const eventId = nuevoEventId()

    // 1) Pixel client-side con eventID para dedup
    if (typeof window.fbq === 'function') {
        window.fbq('track', event, data, { eventID: eventId })
    }

    // 2) CAPI server-side — fire and forget
    void enviarACapi(event, eventId, data, userData)

    emit({ platform: 'fb', event, data, timestamp: new Date() })
}

export function trackFbCustom(event: string, data: Record<string, unknown> = {}) {
    if (typeof window === 'undefined') return
    if (typeof window.fbq === 'function') window.fbq('trackCustom', event, data)
    emit({ platform: 'fb', event, data, timestamp: new Date() })
}

async function enviarACapi(
    event: string,
    eventId: string,
    customData: Record<string, unknown>,
    userData?: MetaUserData,
): Promise<void> {
    try {
        await fetch('/api/meta/event', {
            method:  'POST',
            headers: {
                'Content-Type':     'application/json',
                'X-XSRF-TOKEN':     csrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
                'Accept':           'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                event_name:       event,
                event_id:         eventId,
                event_source_url: window.location.href,
                custom_data:      customData,
                user_data:        userData ?? null,
            }),
            // No queremos bloquear el flujo del usuario — un timeout corto.
            signal: AbortSignal.timeout?.(5000),
        })
    } catch {
        // Silencioso: el Pixel ya disparó. Si CAPI falla, no rompemos UX.
    }
}

/**
 * Dispara una conversión Google Ads. Requiere que el script gtag esté inyectado
 * en el WebLayout y que el devs haya configurado google_ads_id + el conversion
 * label específico de la acción (p.ej. la del Purchase).
 *
 * sendTo formato: 'AW-XXXXXXXXX/LABEL_HASH'
 */
export function trackGoogleAdsConversion(
    sendTo: string,
    data: Record<string, unknown> = {},
) {
    if (typeof window === 'undefined') return

    const payload: Record<string, unknown> = { send_to: sendTo, ...data }

    if (typeof window.gtag === 'function') window.gtag('event', 'conversion', payload)
    emit({ platform: 'google', event: 'conversion', data: payload, timestamp: new Date() })
}
