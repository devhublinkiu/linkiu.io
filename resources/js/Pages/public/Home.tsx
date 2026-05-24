import { type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import WebLayout from '@/Layouts/WebLayout'
import Hero from '@/Components/public/home/hero'
import Ticker from '@/Components/public/home/ticker'
import Beneficios from '@/Components/public/home/beneficios'
import Banners from '@/Components/public/home/banners'
import OfertaRelampago from '@/Components/public/home/oferta-relampago'
import ComoFunciona from '@/Components/public/home/como-funciona'
import Carrusel from '@/Components/public/home/carrusel'
import ProductSpotlight from '@/Components/public/home/product-spotlight'
import Resenas from '@/Components/public/home/resenas'
import Faq from '@/Components/public/home/faq'
import CtaFinal from '@/Components/public/home/cta-final'
import { useNotificacionesCompra } from '@/hooks/useNotificacionesCompra'

type SeccionKey = 'hero' | 'tickers' | 'beneficios' | 'banners' | 'oferta_relampago' | 'como_funciona' | 'carrusel' | 'productos_destacados' | 'resenas' | 'faq' | 'cta'

function Home() {
    useNotificacionesCompra()

    const { build } = usePage<{ build?: { secciones?: Record<SeccionKey, boolean> } }>().props
    const s = build?.secciones

    function visible(key: SeccionKey) {
        return s?.[key] !== false
    }

    return (
        <>
            {visible('hero')                && <Hero />}
            {visible('tickers')             && <Ticker />}
            {visible('beneficios')          && <Beneficios />}
            {visible('banners')             && <Banners />}
            {visible('oferta_relampago')    && <OfertaRelampago />}
            {visible('como_funciona')       && <ComoFunciona />}
            {visible('carrusel')            && <Carrusel />}
            {visible('productos_destacados') && <ProductSpotlight />}
            {visible('resenas')             && <Resenas />}
            {visible('faq')                 && <Faq />}
            {visible('cta')                 && <CtaFinal />}
        </>
    )
}

Home.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default Home
