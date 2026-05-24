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

    const [idx,     setIdx]     = useState(0)
    const [visible, setVisible] = useState(true)
    const [now,     setNow]     = useState(Date.now())

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(t)
    }, [])

    useEffect(() => {
        if (anuncios.length <= 1) return
        const t = setInterval(() => {
            setVisible(false)
            setTimeout(() => {
                setIdx(i => (i + 1) % anuncios.length)
                setVisible(true)
            }, 300)
        }, interval * 1000)
        return () => clearInterval(t)
    }, [anuncios.length, interval])

    if (anuncios.length === 0) return null

    const ann = anuncios[idx % anuncios.length]

    return (
        <div className="sticky top-0 z-50 overflow-hidden" style={{ backgroundColor: bgColor, color: textColor }}>

            {/* Desktop — estático y centrado */}
            <div className={cn(
                'hidden sm:flex items-center justify-center gap-2.5 px-4 py-2.5 text-sm transition-opacity duration-300',
                visible ? 'opacity-100' : 'opacity-0',
            )}>
                <ContenidoBar ann={ann} now={now} />
            </div>

            {/* Móvil — marquee continuo */}
            <div className="sm:hidden py-2.5">
                <div className="flex animate-marquee whitespace-nowrap text-sm">
                    <span className="inline-flex items-center gap-2.5 px-6">
                        <ContenidoBar ann={ann} now={now} />
                    </span>
                    <span className="inline-flex items-center gap-2.5 px-6" aria-hidden>
                        <ContenidoBar ann={ann} now={now} />
                    </span>
                </div>
            </div>

        </div>
    )
}
