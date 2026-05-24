import { useEffect, useRef, useState } from 'react'
import { usePage } from '@inertiajs/react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import PlaceholderImage from '@/Components/public/PlaceholderImage'

interface BannerItem { url: string; ruta: string; link: string | null }
interface BannersConfig {
    velocidad: 'lento' | 'normal' | 'rapido'
    items:     BannerItem[]
}

const INTERVALO: Record<string, number> = {
    lento:  6000,
    normal: 4000,
    rapido: 2000,
}

export default function Banners() {
    const { build } = usePage<{ build?: { banners?: BannersConfig } }>().props

    const cfg   = build?.banners
    const items = cfg?.items ?? []

    const [activo,   setActivo]   = useState(0)
    const intervaloRef            = useRef<ReturnType<typeof setInterval> | null>(null)
    const touchStartX             = useRef<number>(0)

    const ms = INTERVALO[cfg?.velocidad ?? 'normal']

    function siguiente() { setActivo(a => (a + 1) % items.length) }
    function anterior()  { setActivo(a => (a - 1 + items.length) % items.length) }

    function reiniciarIntervalo() {
        if (intervaloRef.current) clearInterval(intervaloRef.current)
        intervaloRef.current = setInterval(siguiente, ms)
    }

    useEffect(() => {
        setActivo(0)
    }, [items.length])

    useEffect(() => {
        if (items.length <= 1) return
        intervaloRef.current = setInterval(siguiente, ms)
        return () => { if (intervaloRef.current) clearInterval(intervaloRef.current) }
    }, [items.length, ms])

    function irA(i: number) {
        setActivo(i)
        reiniciarIntervalo()
    }

    function handleAnterior() { anterior(); reiniciarIntervalo() }
    function handleSiguiente() { siguiente(); reiniciarIntervalo() }

    function onTouchStart(e: React.TouchEvent) {
        touchStartX.current = e.touches[0].clientX
    }

    function onTouchEnd(e: React.TouchEvent) {
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(diff) < 50) return
        if (diff > 0) handleSiguiente()
        else handleAnterior()
    }

    // Sin banners configurados → mostramos un placeholder wireframe que ocupa
    // el mismo espacio (aspect 3/1). El admin sube banners reales desde
    // LinkiuBuild → Inicio → Banners y este placeholder desaparece.
    if (items.length === 0) {
        return (
            <section className="relative w-full overflow-hidden" style={{ aspectRatio: '3/1' }}>
                <PlaceholderImage label="Banner principal" iconSize="lg" className="rounded-none border-0 border-y border-dashed" />
            </section>
        )
    }

    function Slide({ item }: { item: BannerItem }) {
        const img = <img src={item.url} alt="" className="w-full h-full object-cover" draggable={false} />
        if (item.link) {
            return (
                <a href={item.link} className="block w-full h-full">
                    {img}
                </a>
            )
        }
        return img
    }

    return (
        <section className="relative w-full overflow-hidden bg-slate-100" style={{ aspectRatio: '3/1' }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* Slides */}
            <div
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activo * (100 / items.length)}%)`, width: `${items.length * 100}%` }}
            >
                {items.map((item, i) => (
                    <div key={i} className="h-full shrink-0" style={{ width: `${100 / items.length}%` }}>
                        <Slide item={item} />
                    </div>
                ))}
            </div>

            {/* Flechas */}
            {items.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={handleAnterior}
                        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                        aria-label="Anterior"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleSiguiente}
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                        aria-label="Siguiente"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </>
            )}

            {/* Dots */}
            {items.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => irA(i)}
                            aria-label={`Ir al banner ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === activo ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
                            }`}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
