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

/**
 * Deriva la URL del thumb 200x200 a partir de la URL de la imagen original.
 * SubirImagenWebp sube ambas versiones con UUID compartido: {uuid}.webp +
 * {uuid}_thumb.webp. Si el thumb no existe (imágenes pre-Sprint 1.7), el
 * onError de la miniatura cae a la URL original.
 */
function thumbDe(url: string): string {
    return url.replace(/\.webp(\?|$)/i, '_thumb.webp$1')
}

export default function Gallery({ imagenes }: Props) {
    const principal = imagenes.find(i => i.principal) ?? imagenes[0]
    const [activa, setActiva] = useState<ImagenProducto | null>(principal ?? null)
    const scrollRef = useRef<HTMLDivElement>(null)

    if (!activa) return null

    const indiceActivo = imagenes.findIndex(i => i.url === activa.url)
    const tieneVarias  = imagenes.length > 1

    // Cambia la imagen principal ciclando: si estás en la última y das siguiente, vuelve a la primera.
    function cambiarImagen(dir: 'siguiente' | 'anterior') {
        if (! tieneVarias) return
        const total = imagenes.length
        const nuevo = dir === 'siguiente'
            ? (indiceActivo + 1) % total
            : (indiceActivo - 1 + total) % total
        setActiva(imagenes[nuevo])
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Imagen principal — LCP de la página, prioridad alta y dimensiones fijas para evitar CLS */}
            <div className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
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

                {/* Flechas overlay sobre la imagen principal (mobile + desktop) */}
                {tieneVarias && (
                    <>
                        <button
                            type="button"
                            aria-label="Imagen anterior"
                            onClick={() => cambiarImagen('anterior')}
                            className="absolute top-1/2 -translate-y-1/2 left-2 w-10 h-10 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-sm text-slate-700 hover:bg-white transition-colors duration-200"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            aria-label="Imagen siguiente"
                            onClick={() => cambiarImagen('siguiente')}
                            className="absolute top-1/2 -translate-y-1/2 right-2 w-10 h-10 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-sm text-slate-700 hover:bg-white transition-colors duration-200"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>

            {/* Slider de miniaturas — sin flechas de scroll. La navegación principal
                vive en las flechas overlay sobre la imagen. Acá solo se cambia la
                imagen activa con click en la miniatura. */}
            {tieneVarias && (
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
                                src={thumbDe(img.url)}
                                alt={`Miniatura ${i + 1}`}
                                width={64}
                                height={64}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                    // Fallback para imágenes existentes sin thumb generado todavía
                                    const target = e.currentTarget
                                    if (target.src !== img.url) target.src = img.url
                                }}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
