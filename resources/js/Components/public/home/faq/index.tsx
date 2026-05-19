import { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const PREGUNTAS = [
    {
        pregunta: '¿SAVIA funciona en canas completamente blancas?',
        respuesta: 'Sí. SAVIA está formulado específicamente para cubrir canas, incluso las más resistentes. En cabello con más del 80% de canas recomendamos aplicar de raíz a puntas para un resultado uniforme.',
    },
    {
        pregunta: '¿Cuánto dura el resultado?',
        respuesta: 'La cobertura dura entre 3 y 5 semanas dependiendo del ritmo de crecimiento del cabello y de la frecuencia de lavado. Recomendamos lavar con shampoo para cabello teñido para prolongar el resultado.',
    },
    {
        pregunta: '¿Puedo usarlo si tengo el cabello dañado o procesado?',
        respuesta: 'SAVIA es apto para cabello procesado, decolorado o con tratamientos químicos previos. Al no contener amoníaco ni peróxido, no agrega daño adicional. Si tu cabello está muy poroso, el tono puede absorber con más intensidad.',
    },
    {
        pregunta: '¿El kit incluye todo lo que necesito?',
        respuesta: 'Sí. El kit completo incluye la coloración SAVIA 300ml, el activador de color, un acondicionador post-color, guantes de aplicación y el instructivo paso a paso. No necesitas comprar nada más.',
    },
    {
        pregunta: '¿Cuánto tiempo tarda en llegar el pedido?',
        respuesta: 'Los pedidos se despachan en 24 horas hábiles. El tiempo de entrega es de 2 a 5 días hábiles dependiendo de la ciudad. Bogotá, Medellín, Cali y Barranquilla suelen recibir en 1-2 días hábiles.',
    },
    {
        pregunta: '¿Tiene garantía o política de devolución?',
        respuesta: 'Si no quedas satisfecha con el resultado, contáctanos dentro de los 15 días siguientes a la compra. Evaluamos cada caso y ofrecemos reposición o devolución del dinero sin complicaciones.',
    },
]

export default function Faq() {
    const [abierto, setAbierto] = useState<number | null>(0)

    return (
        <section className="bg-white py-16">
            <div className="max-w-3xl mx-auto px-6">

                <div className="mb-12">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                        Preguntas frecuentes
                    </h2>
                    <p className="mt-3 text-xl text-slate-500">
                        Todo lo que necesitas saber antes de tu primera compra.
                    </p>
                </div>

                <div className="flex flex-col divide-y divide-slate-100">
                    {PREGUNTAS.map(({ pregunta, respuesta }, i) => (
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
