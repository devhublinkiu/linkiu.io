import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import { Toaster } from '@/Components/ui/Sonner'
import AnnouncementBar from '@/Components/public/navbar/parts/AnnouncementBar'
import Navbar from '@/Components/public/navbar'
import { CartProvider } from '@/contexts/CartContext'

interface SharedProps {
    fb_pixel_id:        string | null
    fb_test_event_code: string | null
    [key: string]: unknown
}

interface WebLayoutProps {
    children: React.ReactNode
}

function FbPixel() {
    const { fb_pixel_id, fb_test_event_code } = usePage<SharedProps>().props

    useEffect(() => {
        if (!fb_pixel_id) return
        if (document.getElementById('fb-pixel-script')) return

        const s = document.createElement('script')
        s.id  = 'fb-pixel-script'
        s.async = true

        const initOptions = fb_test_event_code
            ? `fbq('init', '${fb_pixel_id}', {}, { test_event_code: '${fb_test_event_code}' });`
            : `fbq('init', '${fb_pixel_id}');`

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
    }, [fb_pixel_id, fb_test_event_code])

    return null
}

export default function WebLayout({ children }: WebLayoutProps) {
    return (
        <CartProvider>
            <FbPixel />
            <AnnouncementBar />
            <Navbar />
            <main>
                {children}
            </main>
            <Toaster />
        </CartProvider>
    )
}
