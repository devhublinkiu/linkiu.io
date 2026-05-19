declare global {
    interface Window {
        fbq: (...args: unknown[]) => void
        _fbq: unknown
    }
}

export interface PixelEvent {
    platform:  'fb'
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
