import { useCallback, useEffect, useRef, useState } from 'react'

interface ImagenItem { url: string }

interface Config {
    titulo?:         string
    imagen_antes?:   ImagenItem
    imagen_despues?: ImagenItem
}

interface Props {
    config: Record<string, unknown>
}

export default function AntesDespues({ config }: Props) {
    const cfg = config as Config

    const imagenAntes   = cfg.imagen_antes?.url
    const imagenDespues = cfg.imagen_despues?.url

    if (!imagenAntes || !imagenDespues) return null

    const [posicion,    setPosicion]    = useState(50)
    const [arrastrando, setArrastrando] = useState(false)
    const contenedorRef = useRef<HTMLDivElement>(null)

    const calcularPosicion = useCallback((clientX: number) => {
        const rect = contenedorRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
        setPosicion((x / rect.width) * 100)
    }, [])

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!arrastrando) return
        calcularPosicion(e.clientX)
    }, [arrastrando, calcularPosicion])

    useEffect(() => {
        const stopDrag = () => setArrastrando(false)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', stopDrag)
        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', stopDrag)
        }
    }, [onMouseMove])

    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                {cfg.titulo ?? 'Antes y después'}
            </h2>
            <p className="text-base text-slate-500 mb-6">
                Arrastra para ver el resultado.
            </p>

            <div
                ref={contenedorRef}
                className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-col-resize select-none border border-slate-200"
                onMouseDown={() => setArrastrando(true)}
                onTouchMove={e => calcularPosicion(e.touches[0].clientX)}
            >
                {/* después */}
                <div className="absolute inset-0">
                    <img
                        src={imagenDespues}
                        alt="Después"
                        className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-4 right-4 text-xs font-medium text-white bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        después
                    </span>
                </div>

                {/* antes — recortado por posicion */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - posicion}% 0 0)` }}
                >
                    <img
                        src={imagenAntes}
                        alt="Antes"
                        className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-4 left-4 text-xs font-medium text-slate-700 bg-white/80 px-3 py-1.5 rounded-full backdrop-blur-sm border border-slate-200/60">
                        antes
                    </span>
                </div>

                {/* Handle */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                    style={{ left: `${posicion}%` }}
                >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-xl border-2 border-white flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    )
}
