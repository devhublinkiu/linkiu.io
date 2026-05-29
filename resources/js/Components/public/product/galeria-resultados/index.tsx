import { useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagenItem { url: string; ruta: string }

interface Props {
    config: Record<string, unknown>
}

export default function GaleriaResultados({ config }: Props) {
    const titulo   = (config.titulo   as string       | undefined) ?? 'Resultados reales'
    const imagenes = (config.imagenes as ImagenItem[] | undefined) ?? []
    const [activo, setActivo] = useState(0)

    if (imagenes.length === 0) return null

    const total = imagenes.length

    function ir(idx: number) { setActivo((idx + total) % total) }

    useEffect(() => {
        if (total <= 1) return
        const t = setInterval(() => setActivo(i => (i + 1) % total), 10000)
        return () => clearInterval(t)
    }, [total])

    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">{titulo}</h2>

            <div className="flex flex-col items-center gap-4">
                {/* Imagen + flechas a los lados */}
                <div className="flex items-center gap-3">
                    {total > 1 && (
                        <button
                            type="button"
                            aria-label="Resultado anterior"
                            onClick={() => ir(activo - 1)}
                            className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors duration-200 shrink-0"
                        >
                            <ChevronLeftIcon className="w-4 h-4 text-slate-500" />
                        </button>
                    )}

                    <div className="w-full max-w-[260px] overflow-hidden rounded-2xl">
                        <div
                            className="flex transition-transform duration-700 ease-in-out"
                            style={{ transform: `translateX(-${activo * 100}%)` }}
                        >
                            {imagenes.map((img, i) => (
                                <div key={i} className="w-full shrink-0">
                                    <img src={img.url} alt={`Resultado ${i + 1}`} loading="lazy" decoding="async" className="w-full aspect-[9/16] object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {total > 1 && (
                        <button
                            type="button"
                            aria-label="Resultado siguiente"
                            onClick={() => ir(activo + 1)}
                            className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors duration-200 shrink-0"
                        >
                            <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                        </button>
                    )}
                </div>

                {/* Dots */}
                {total > 1 && (
                    <div className="flex gap-1.5">
                        {imagenes.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Ir al resultado ${i + 1}`}
                                aria-current={i === activo ? 'true' : undefined}
                                onClick={() => ir(i)}
                                className={cn(
                                    'rounded-full transition-all duration-300',
                                    i === activo ? 'w-5 h-1.5 bg-slate-800' : 'w-1.5 h-1.5 bg-slate-200 hover:bg-slate-300'
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
