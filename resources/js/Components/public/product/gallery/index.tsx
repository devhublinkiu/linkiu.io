import { useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ImagenProducto {
    url:       string
    principal: boolean
}

type Props = {
    imagenes: ImagenProducto[]
}

export default function Gallery({ imagenes }: Props) {
    const principal = imagenes.find(i => i.principal) ?? imagenes[0]
    const [activa, setActiva] = useState<ImagenProducto | null>(principal ?? null)
    const scrollRef = useRef<HTMLDivElement>(null)

    if (!activa) return null

    function scroll(dir: 'left' | 'right') {
        scrollRef.current?.scrollBy({ left: dir === 'left' ? -80 : 80, behavior: 'smooth' })
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Imagen principal — LCP de la página, prioridad alta y dimensiones fijas para evitar CLS */}
            <div className="aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <img
                    key={activa.url}
                    src={activa.url}
                    alt="Imagen principal del producto"
                    width={600}
                    height={600}
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Slider de miniaturas */}
            {imagenes.length > 1 && (
                <div className="relative flex items-center gap-1">
                    <button
                        type="button"
                        aria-label="Miniaturas anteriores"
                        onClick={() => scroll('left')}
                        className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors duration-200"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex gap-2 overflow-x-auto scroll-smooth"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {imagenes.map((img, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Ver imagen ${i + 1}`}
                                onClick={() => setActiva(img)}
                                className={cn(
                                    'w-16 h-16 rounded-lg border-2 overflow-hidden transition-all duration-200 ease-in-out shrink-0',
                                    activa.url === img.url
                                        ? 'border-slate-900'
                                        : 'border-slate-200 hover:border-slate-400'
                                )}
                            >
                                <img
                                    src={img.url}
                                    alt={`Miniatura ${i + 1}`}
                                    width={64}
                                    height={64}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        aria-label="Miniaturas siguientes"
                        onClick={() => scroll('right')}
                        className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors duration-200"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
