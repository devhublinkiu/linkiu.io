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

export function trackFb(event: string, data: Record<string, unknown> = {}) {
    if (typeof window === 'undefined') return
    if (typeof window.fbq === 'function') window.fbq('track', event, data)
    emit({ platform: 'fb', event, data, timestamp: new Date() })
}

export function trackFbCustom(event: string, data: Record<string, unknown> = {}) {
    if (typeof window === 'undefined') return
    if (typeof window.fbq === 'function') window.fbq('trackCustom', event, data)
    emit({ platform: 'fb', event, data, timestamp: new Date() })
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
