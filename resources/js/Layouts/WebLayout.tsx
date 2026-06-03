import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import { Toaster } from '@/Components/ui/Sonner'
import AnnouncementBar from '@/Components/public/navbar/parts/AnnouncementBar'
import Navbar from '@/Components/public/navbar'
import PixelDebug from '@/Components/public/product/pixel-debug'
import { CartProvider } from '@/contexts/CartContext'

interface SharedProps {
    fb_pixel_id:        string | null
    fb_test_event_code: string | null
    google_ads_id:      string | null
    [key: string]: unknown
}

interface WebLayoutProps {
    children: React.ReactNode
}

// Defense in depth: el backend valida con regex estricto, pero si la BD se
// corrompe o alguien hace UPDATE manual, sanitizamos antes de interpolar
// en código JavaScript ejecutable. Bloquea cualquier intento de XSS.
function sanitizarPixelId(valor: string | null): string | null {
    if (!valor) return null
    return /^\d{6,20}$/.test(valor) ? valor : null
}

function sanitizarTestCode(valor: string | null): string | null {
    if (!valor) return null
    return /^[A-Z0-9_-]{1,50}$/i.test(valor) ? valor : null
}

function sanitizarGoogleAdsId(valor: string | null): string | null {
    if (!valor) return null
    return /^AW-\d{6,12}$/i.test(valor) ? valor : null
}

// Carga deferida: requestIdleCallback con fallback a setTimeout (Safari).
// Mantiene tracking + CAPI dedup pero no compite con el LCP.
function cargarDiferido(cb: () => void) {
    const ric: ((cb: () => void) => number) | undefined =
        (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback
    if (ric) ric(cb)
    else window.setTimeout(cb, 2000)
}

function FbPixel() {
    const { fb_pixel_id, fb_test_event_code } = usePage<SharedProps>().props
    const pixelId  = sanitizarPixelId(fb_pixel_id)
    const testCode = sanitizarTestCode(fb_test_event_code)

    useEffect(() => {
        if (!pixelId) return
        if (document.getElementById('fb-pixel-script')) return

        // Importante: el snippet se ejecuta inmediato (sin requestIdleCallback)
        // porque define el proxy window.fbq que encola eventos hasta que
        // fbevents.js termine de cargar. Sin esto, cualquier trackFb que se
        // dispare antes del idle (p.ej. ViewContent en Product.tsx) llega sin
        // event_id y rompe la dedup con CAPI — Meta lo flagea explícitamente.
        //
        // El render NO se bloquea: el snippet pesa <1KB y el fbevents.js que
        // descarga está marcado async dentro del propio snippet.
        const s = document.createElement('script')
        s.id  = 'fb-pixel-script'
        s.async = true

        const initOptions = testCode
            ? `fbq('init', '${pixelId}', {}, { test_event_code: '${testCode}' });`
            : `fbq('init', '${pixelId}');`

        s.textContent = `
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
            n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            ${initOptions}
            fbq('track', 'PageView');
        `
        document.head.appendChild(s)
    }, [pixelId, testCode])

    if (!pixelId) return null

    // Fallback para visitantes sin JavaScript habilitado: img tracking pixel.
    return (
        <noscript>
            <img
                height="1"
                width="1"
                alt=""
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            />
        </noscript>
    )
}

function GoogleAdsScript() {
    const { google_ads_id } = usePage<SharedProps>().props

    useEffect(() => {
        const adsId = sanitizarGoogleAdsId(google_ads_id)

        if (!adsId) return
        if (document.getElementById('google-ads-script')) return

        // Carga deferida — gtag.js también pesa y bloquea el render si entra antes del LCP.
        cargarDiferido(() => {
            // Loader gtag.js
            const loader = document.createElement('script')
            loader.id    = 'google-ads-script'
            loader.async = true
            loader.src   = `https://www.googletagmanager.com/gtag/js?id=${adsId}`
            document.head.appendChild(loader)

            // Inicialización + config con el ID
            const init = document.createElement('script')
            init.id    = 'google-ads-init'
            init.textContent = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${adsId}');
            `
            document.head.appendChild(init)
        })
    }, [google_ads_id])

    return null
}

// Heartbeat de presencia para Vista en tiempo real del admin. Avisa cada 30s
// mientras la pestaña este visible. Cuando el visitante cierra/oculta la
// pestaña, manda un beacon de desconexion para que el conteo baje al instante
// (sin esperar al TTL de 35s en el server).
function HeartbeatPresencia() {
    useEffect(() => {
        function obtenerCsrf() {
            return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? ''
        }

        function tick() {
            if (document.visibilityState !== 'visible') return
            fetch('/api/heartbeat', {
                method:    'POST',
                headers:   { 'X-CSRF-TOKEN': obtenerCsrf(), 'Accept': 'application/json' },
                keepalive: true,
            }).catch(() => {})
        }

        function desconectar() {
            // sendBeacon es mas fiable que fetch durante beforeunload/visibilitychange:
            // el navegador garantiza el envio incluso si la pagina ya esta cerrando.
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

        tick()
        const timer = setInterval(tick, 30_000)
        window.addEventListener('beforeunload', desconectar)
        document.addEventListener('visibilitychange', onVisibility)

        return () => {
            clearInterval(timer)
            window.removeEventListener('beforeunload', desconectar)
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [])

    return null
}

export default function WebLayout({ children }: WebLayoutProps) {
    return (
        <CartProvider>
            <FbPixel />
            <GoogleAdsScript />
            <HeartbeatPresencia />
            <AnnouncementBar />
            <Navbar />
            <main>
                {children}
            </main>
            <Toaster />
            <PixelDebug />
        </CartProvider>
    )
}
