import { useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagenItem { url: string }

interface Config {
    imagenes?:  ImagenItem[]
    autoplay?:  boolean
    intervalo?: number
}

interface Props {
    config: Record<string, unknown>
}

/**
 * Slider de capturas de reseñas con altura adaptable: el contenedor crece o
 * encoge para mostrar la imagen activa entera, sin recorte y sin cajas vacías
 * arriba/abajo. La transición de altura es de 350ms para suavizar el cambio.
 *
 * Trade-off conocido: causa CLS al cambiar de slide. Aceptado por el equipo,
 * lo importante es que la captura no se recorte. Para evitar salto en mount,
 * mientras la primera imagen no carga se aplica un min-height de 320px.
 */
export default function ResenasImagen({ config }: Props) {
    const cfg       = config as Config
    const imagenes  = cfg.imagenes ?? []
    const autoplay  = cfg.autoplay  ?? false
    const intervalo = (cfg.intervalo ?? 5) * 1000

    const [activo,   setActivo]   = useState(0)
    const [animando, setAnimando] = useState(false)
    const [pausado,  setPausado]  = useState(false)
    const [alto,     setAlto]     = useState<number | null>(null)

    const slideRefs = useRef<(HTMLDivElement | null)[]>([])

    // Mide el alto del slide activo cuando carga o cambia. ResizeObserver
    // cubre tanto el cambio de slide como el resize de viewport.
    useEffect(() => {
        const el = slideRefs.current[activo]
        if (!el) return

        const medir = () => {
            const h = el.getBoundingClientRect().height
            if (h > 0) setAlto(h)
        }

        medir()
        const ro = new ResizeObserver(medir)
        ro.observe(el)
        return () => ro.disconnect()
    }, [activo, imagenes.length])

    if (!imagenes.length) return null

    function ir(idx: number) {
        if (animando) return
        setAnimando(true)
        setActivo((idx + imagenes.length) % imagenes.length)
        setTimeout(() => setAnimando(false), 400)
    }

    useEffect(() => {
        if (! autoplay || pausado || imagenes.length < 2) return
        const t = setInterval(() => ir(activo + 1), intervalo)
        return () => clearInterval(t)
    }, [activo, autoplay, pausado, intervalo, imagenes.length])

    return (
        <div
            className="relative overflow-hidden select-none bg-slate-50 rounded-xl border border-slate-200"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            style={{
                height:     alto ? `${alto}px` : undefined,
                minHeight:  alto ? undefined : '320px',
                transition: 'height 350ms ease-in-out',
            }}
        >
            {/* Track horizontal */}
            <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${activo * 100}%)` }}
            >
                {imagenes.map((img, i) => (
                    <div
                        key={i}
                        ref={el => { slideRefs.current[i] = el }}
                        className="w-full shrink-0 flex items-center justify-center"
                        style={{ minWidth: '100%' }}
                    >
                        <img
                            src={img.url}
                            alt={`Reseña ${i + 1}`}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            className="w-full h-auto object-contain"
                            onLoad={() => {
                                if (i !== activo) return
                                const el = slideRefs.current[i]
                                if (el) setAlto(el.getBoundingClientRect().height)
                            }}
                        />
                    </div>
                ))}
            </div>

            {imagenes.length > 1 && (
                <>
                    <button
                        type="button"
                        aria-label="Reseña anterior"
                        onClick={() => ir(activo - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:bg-white transition-colors duration-200"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Reseña siguiente"
                        onClick={() => ir(activo + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:bg-white transition-colors duration-200"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {imagenes.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Ir a reseña ${i + 1}`}
                                aria-current={i === activo ? 'true' : undefined}
                                onClick={() => ir(i)}
                                className={cn(
                                    'rounded-full transition-all duration-300',
                                    i === activo ? 'w-5 h-1.5 bg-slate-900' : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-500'
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
