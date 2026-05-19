import { type ReactNode } from 'react'
import WebLayout from '@/Layouts/WebLayout'
import Hero from '@/Components/public/home/hero'
import Ticker from '@/Components/public/home/ticker'
import Beneficios from '@/Components/public/home/beneficios'
import OfertaRelampago from '@/Components/public/home/oferta-relampago'
import ComoFunciona from '@/Components/public/home/como-funciona'
import ProductSpotlight from '@/Components/public/home/product-spotlight'
import Resenas from '@/Components/public/home/resenas'
import Faq from '@/Components/public/home/faq'
import CtaFinal from '@/Components/public/home/cta-final'
import { useNotificacionesCompra } from '@/hooks/useNotificacionesCompra'

function Home() {
    useNotificacionesCompra()

    return (
        <>
            <Hero />
            <Ticker />
            <Beneficios />
            <OfertaRelampago />
            <ComoFunciona />
            <ProductSpotlight />
            <Resenas />
            <Faq />
            <CtaFinal />
        </>
    )
}

Home.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default Home
