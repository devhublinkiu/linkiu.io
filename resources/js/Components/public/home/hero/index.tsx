import { usePage } from '@inertiajs/react'
import HeroText from './parts/HeroText'
import HeroBottle from './parts/HeroBottle'

interface Colores { primario: string; secundario: string; acento: string }
interface HeroConfig { color_texto?: string }

export default function Hero() {
    const { build } = usePage<{
        build?: { hero?: HeroConfig; colores?: Colores }
    }>().props

    const colores   = build?.colores ?? { primario: '#314158', secundario: '#62748E', acento: '#FB2C36' }
    const hero      = build?.hero

    function resolverColor(token: string): string {
        if (token === 'primario')   return colores.primario
        if (token === 'secundario') return colores.secundario
        if (token === 'acento')     return colores.acento
        if (token === 'blanco')     return '#FFFFFF'
        return '#000000'
    }

    const textColor = resolverColor(hero?.color_texto ?? 'primario')

    return (
        <section className="bg-gradient-to-b from-white to-slate-50" style={{ color: textColor }}>
            <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24 flex flex-col items-center gap-12">
                <HeroText />
                <HeroBottle />
            </div>
        </section>
    )
}
