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

function FbPixel() {
    const { fb_pixel_id, fb_test_event_code } = usePage<SharedProps>().props
    const pixelId  = sanitizarPixelId(fb_pixel_id)
    const testCode = sanitizarTestCode(fb_test_event_code)

    useEffect(() => {
        if (!pixelId) return
        if (document.getElementById('fb-pixel-script')) return

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
    }, [google_ads_id])

    return null
}

export default function WebLayout({ children }: WebLayoutProps) {
    return (
        <CartProvider>
            <FbPixel />
            <GoogleAdsScript />
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
