import { useState } from 'react'
import { PlusIcon, MinusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Faq {
    pregunta:  string
    respuesta: string
}

interface Props {
    config: Record<string, unknown>
}

export default function FaqProducto({ config }: Props) {
    const faqs = (config.faqs as Faq[] | undefined) ?? []
    const [abierto, setAbierto] = useState<number | null>(null)

    if (faqs.length === 0) return null

    const titulo = (config.titulo as string | undefined) ?? 'Preguntas frecuentes'

    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
                {titulo}
            </h2>

            <div className="flex flex-col gap-2">
                {faqs.map(({ pregunta, respuesta }, i) => {
                    const estaAbierto = abierto === i
                    return (
                        <div
                            key={i}
                            className={cn(
                                'rounded-xl border transition-colors duration-200 overflow-hidden',
                                estaAbierto ? 'border-slate-300 bg-white' : 'border-slate-200 bg-white hover:border-slate-300'
                            )}
                        >
                            <button
                                onClick={() => setAbierto(estaAbierto ? null : i)}
                                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                            >
                                <span className={cn(
                                    'text-sm font-semibold transition-colors duration-200',
                                    estaAbierto ? 'text-slate-900' : 'text-slate-700'
                                )}>
                                    {pregunta}
                                </span>
                                <div className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200',
                                    estaAbierto ? 'bg-slate-900' : 'bg-slate-200'
                                )}>
                                    {estaAbierto
                                        ? <MinusIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                                        : <PlusIcon className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.5} />
                                    }
                                </div>
                            </button>
                            {estaAbierto && (
                                <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                                    {respuesta}
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
