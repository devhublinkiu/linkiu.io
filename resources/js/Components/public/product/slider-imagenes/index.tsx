import { useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagenItem { url: string }

interface Config {
    imagenes?: ImagenItem[]
}

interface Props {
    config: Record<string, unknown>
}

export default function SliderImagenes({ config }: Props) {
    const cfg      = config as Config
    const imagenes = cfg.imagenes ?? []

    const [activo,   setActivo]   = useState(0)
    const [animando, setAnimando] = useState(false)

    if (!imagenes.length) return null

    function ir(idx: number) {
        if (animando) return
        setAnimando(true)
        setActivo((idx + imagenes.length) % imagenes.length)
        setTimeout(() => setAnimando(false), 400)
    }

    useEffect(() => {
        const t = setInterval(() => ir(activo + 1), 3500)
        return () => clearInterval(t)
    }, [activo])

    return (
        <div className="relative overflow-hidden select-none">

            {/* Track */}
            <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activo * 100}%)` }}
            >
                {imagenes.map((img, i) => (
                    <div
                        key={i}
                        className="w-full shrink-0"
                        style={{ minWidth: '100%' }}
                    >
                        <img
                            src={img.url}
                            alt=""
                            className="w-full h-auto object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Flechas */}
            {imagenes.length > 1 && (
                <>
                    <button
                        onClick={() => ir(activo - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors duration-200 backdrop-blur-sm"
                    >
                        <ChevronLeftIcon className="w-4 h-4 text-white" />
                    </button>
                    <button
                        onClick={() => ir(activo + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors duration-200 backdrop-blur-sm"
                    >
                        <ChevronRightIcon className="w-4 h-4 text-white" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {imagenes.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => ir(i)}
                                className={cn(
                                    'rounded-full transition-all duration-300',
                                    i === activo ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/70'
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
