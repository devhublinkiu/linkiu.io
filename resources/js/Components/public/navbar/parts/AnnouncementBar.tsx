import { useEffect, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { cn } from '@/lib/utils'

interface Anuncio {
    id:        number
    texto:     string
    btn_texto: string | null
    btn_link:  string | null
    fin_timer: string | null
}

function formatearTiempo(ms: number): string {
    const seg = Math.max(0, Math.floor(ms / 1000))
    const h = Math.floor(seg / 3600)
    const m = Math.floor((seg % 3600) / 60)
    const s = seg % 60
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function ContenidoBar({ ann, now }: { ann: Anuncio; now: number }) {
    const tiempoRestante = ann.fin_timer !== null ? new Date(ann.fin_timer).getTime() - now : null
    const urgente        = tiempoRestante !== null && tiempoRestante < 3600 * 1000

    return (
        <>
            <span className="font-bold">{ann.texto}</span>
            {tiempoRestante !== null && tiempoRestante > 0 && (
                <>
                    <span className="opacity-50">·</span>
                    <span className={cn(
                        'inline-flex items-center justify-center text-xs font-bold px-2 py-0.5 rounded-full tabular-nums transition-colors duration-200',
                        urgente ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-white',
                    )}>
                        {formatearTiempo(tiempoRestante)}
                    </span>
                </>
            )}
            {ann.btn_texto && ann.btn_link && (
                <>
                    <span className="opacity-50">·</span>
                    <Link
                        href={ann.btn_link}
                        className="font-semibold underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity duration-200 ease-in-out whitespace-nowrap"
                    >
                        {ann.btn_texto} →
                    </Link>
                </>
            )}
        </>
    )
}

interface Colores { primario: string; secundario: string; acento: string }

export default function AnnouncementBar() {
    const { build } = usePage<{
        build?: {
            anuncios?: Anuncio[]
            ticker?:   { interval?: number; color_bg?: string; color_text?: string }
            colores?:  Colores
        }
    }>().props

    const anuncios = build?.anuncios ?? []
    const ticker   = build?.ticker
    const interval = ticker?.interval ?? 10

    const colores = build?.colores ?? { primario: '#314158', secundario: '#62748E', acento: '#FB2C36' }

    function resolverColor(token: string): string {
        if (token === 'primario')   return colores.primario
        if (token === 'secundario') return colores.secundario
        if (token === 'acento')     return colores.acento
        if (token === 'blanco')     return '#FFFFFF'
        return '#000000'
    }

    const bgColor   = resolverColor(ticker?.color_bg   ?? 'primario')
    const textColor = resolverColor(ticker?.color_text ?? 'blanco')

    const [idx, setIdx]               = useState(0)
    const [animar, setAnimar]         = useState(true)
    const [now, setNow]               = useState(Date.now())

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(t)
    }, [])

    useEffect(() => {
        if (anuncios.length <= 1) return
        const t = setInterval(() => {
            setAnimar(true)
            setIdx(i => i + 1)
        }, interval * 1000)
        return () => clearInterval(t)
    }, [anuncios.length, interval])

    // Loop infinito: cuando llegamos al clon (anuncios.length), esperamos a que
    // termine la transición y volvemos a idx=0 sin animar — visualmente queda
    // en el mismo lugar (clon === original) pero el contador se reinicia.
    useEffect(() => {
        if (anuncios.length <= 1 || idx !== anuncios.length) return
        const t = setTimeout(() => {
            setAnimar(false)
            setIdx(0)
            // Re-habilitar animación en el siguiente frame para que el próximo tick anime suave.
            requestAnimationFrame(() => requestAnimationFrame(() => setAnimar(true)))
        }, 500) // = duration-500
        return () => clearTimeout(t)
    }, [idx, anuncios.length])

    if (anuncios.length === 0) return null

    // Slides + clon del primero al final para crear el efecto loop infinito.
    const slides = anuncios.length > 1 ? [...anuncios, anuncios[0]] : anuncios

    // translateY se refiere a la altura del propio elemento (la columna apilada),
    // no a la del viewport. Por eso dividimos 100% entre la cantidad de slides
    // para avanzar UNO solo en cada tick.
    const offsetPct = slides.length > 0 ? (idx * 100) / slides.length : 0

    return (
        <div className="sticky top-0 z-50 overflow-hidden h-10" style={{ backgroundColor: bgColor, color: textColor }}>
            <div
                className={cn('flex flex-col', animar && 'transition-transform duration-500 ease-in-out')}
                style={{ transform: `translateY(-${offsetPct}%)` }}
            >
                {slides.map((ann, i) => (
                    <div
                        key={`${ann.id}-${i}`}
                        className="h-10 flex items-center justify-center gap-2.5 px-4 text-sm shrink-0"
                    >
                        <ContenidoBar ann={ann} now={now} />
                    </div>
                ))}
            </div>
        </div>
    )
}
