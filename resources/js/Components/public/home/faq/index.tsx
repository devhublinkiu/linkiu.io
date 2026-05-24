import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FaqItem { pregunta: string; respuesta: string }
export interface FaqConfig { titulo: string | null; descripcion: string | null; items: FaqItem[] }

const FALLBACK: FaqItem[] = [
    { pregunta: '¿Cómo puedo realizar mi pedido?',  respuesta: 'Puedes hacer tu pedido directamente desde nuestra tienda en línea de forma rápida y segura.' },
    { pregunta: '¿Cuánto demora el envío?',          respuesta: 'Los pedidos se despachan en 24 horas hábiles y llegan en 2 a 5 días hábiles dependiendo de la ciudad.' },
    { pregunta: '¿Tienen política de devoluciones?', respuesta: 'Sí, tienes 15 días desde la compra para solicitar cambio o devolución del dinero sin complicaciones.' },
]

export default function Faq({ config: configOverride }: { config?: FaqConfig | null } = {}) {
    const { build } = usePage<{ build?: { faq?: FaqConfig } }>().props

    const cfg   = configOverride ?? build?.faq
    const items = cfg?.items?.length ? cfg.items : FALLBACK
    const titulo = cfg?.titulo      || 'Preguntas frecuentes'
    const desc   = cfg?.descripcion || 'Todo lo que necesitas saber antes de tu primera compra.'

    const [abierto, setAbierto] = useState<number | null>(0)

    return (
        <section className="bg-white py-16">
            <div className="max-w-3xl mx-auto px-6">

                <div className="mb-12">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{titulo}</h2>
                    <p className="mt-3 text-xl text-slate-500">{desc}</p>
                </div>

                <div className="flex flex-col divide-y divide-slate-100">
                    {items.map(({ pregunta, respuesta }, i) => (
                        <div key={i}>
                            <button
                                onClick={() => setAbierto(abierto === i ? null : i)}
                                className="w-full flex items-center justify-between gap-4 py-5 text-left"
                            >
                                <span className={cn(
                                    'text-base font-semibold transition-colors duration-200',
                                    abierto === i ? 'text-slate-900' : 'text-slate-700'
                                )}>
                                    {pregunta}
                                </span>
                                <ChevronDownIcon className={cn(
                                    'w-5 h-5 shrink-0 text-slate-400 transition-transform duration-200',
                                    abierto === i && 'rotate-180'
                                )} />
                            </button>
                            {abierto === i && (
                                <p className="pb-5 text-base text-slate-500 leading-relaxed">
                                    {respuesta}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
