import { useEffect, useState } from 'react'
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const RESENAS = [
    { nombre: 'María F. L.',    ciudad: 'Bogotá',       estrellas: 5, iniciales: 'MF', color: 'bg-emerald-500',
      texto: 'Increíble. Llevaba años con tintes de amoníaco y siempre terminaba con el cabello reseco. Con SAVIA mis canas quedaron cubiertas y el cabello se siente suave. No vuelvo al tinte tradicional.' },
    { nombre: 'Valentina R.',   ciudad: 'Medellín',     estrellas: 5, iniciales: 'VR', color: 'bg-slate-600',
      texto: 'Seguí los tres pasos y desde la primera aplicación quedé feliz. El tono castaño igualito a mi color natural. La duración es real: 4 semanas sin retoques.' },
    { nombre: 'Camila Torres',  ciudad: 'Cali',         estrellas: 5, iniciales: 'CT', color: 'bg-amber-500',
      texto: 'Lo probé con desconfianza. Ahora lo recomiendo a todas. El resultado dura semanas y el cabello queda brillante, sin ese olor fuerte del tinte normal.' },
    { nombre: 'Luisa Pedraza',  ciudad: 'Bucaramanga',  estrellas: 4, iniciales: 'LP', color: 'bg-blue-500',
      texto: 'Muy buena experiencia. La cobertura en canas fue total. Solo quiero más variedad de tonos, pero el resultado es excelente.' },
    { nombre: 'Daniela M.',     ciudad: 'Barranquilla', estrellas: 5, iniciales: 'DM', color: 'bg-rose-500',
      texto: 'Llevo 4 meses usando SAVIA y no pienso cambiar. Mi cabello está más fuerte y mi peluquera no puede creer que lo hago en casa.' },
    { nombre: 'Andrea C.',      ciudad: 'Manizales',    estrellas: 5, iniciales: 'AC', color: 'bg-violet-500',
      texto: 'Vale cada peso. Kit completo, incluye todo lo que necesitas. Resultado profesional. Ya hice mi segundo pedido.' },
]

const DISTRIBUCION = [
    { estrellas: 5, porcentaje: 78 },
    { estrellas: 4, porcentaje: 14 },
    { estrellas: 3, porcentaje: 5  },
    { estrellas: 2, porcentaje: 2  },
    { estrellas: 1, porcentaje: 1  },
]

function Estrellas({ valor, size = 'sm' }: { valor: number; size?: 'sm' | 'md' }) {
    const cls = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'
    return (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <StarIcon key={i} className={cn(cls, i <= valor ? 'text-amber-500' : 'text-slate-200')} fill="currentColor" />
            ))}
        </div>
    )
}

export default function ResenasProducto() {
    const [activo, setActivo] = useState(0)
    const total = RESENAS.length

    function ir(idx: number) {
        setActivo((idx + total) % total)
    }

    useEffect(() => {
        const t = setInterval(() => ir(activo + 1), 5000)
        return () => clearInterval(t)
    }, [activo])

    return (
        <section>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">
                Reseñas de clientes
            </h2>

            {/* Resumen de rating */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                <div className="text-center shrink-0">
                    <span className="text-5xl font-bold text-slate-900 leading-none">4.7</span>
                    <div className="flex justify-center mt-1.5">
                        <Estrellas valor={5} size="md" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">312 reseñas</p>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                    {DISTRIBUCION.map(({ estrellas, porcentaje }) => (
                        <div key={estrellas} className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 w-3 shrink-0">{estrellas}</span>
                            <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-7 text-right shrink-0">{porcentaje}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Slider */}
            <div className="relative overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${activo * 100}%)` }}
                >
                    {RESENAS.map(({ nombre, ciudad, estrellas, texto, iniciales, color }) => (
                        <div
                            key={nombre}
                            className="w-full shrink-0 flex flex-col gap-4 border border-slate-200 rounded-xl p-6 bg-white"
                            style={{ minWidth: '100%' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center shrink-0`}>
                                        <span className="text-white text-xs font-bold">{iniciales}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{nombre}</p>
                                        <p className="text-xs text-slate-400">{ciudad}</p>
                                    </div>
                                </div>
                                <Estrellas valor={estrellas} />
                            </div>

                            {/* Texto */}
                            <div className="relative pl-4 border-l-2 border-slate-100">
                                <p className="text-sm text-slate-600 leading-relaxed italic">"{texto}"</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Flechas */}
                <button
                    onClick={() => ir(activo - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                    <ChevronLeftIcon className="w-4 h-4 text-slate-500" />
                </button>
                <button
                    onClick={() => ir(activo + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                    <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 mt-4">
                {RESENAS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => ir(i)}
                        className={cn(
                            'rounded-full transition-all duration-300',
                            i === activo ? 'w-5 h-1.5 bg-slate-800' : 'w-1.5 h-1.5 bg-slate-200 hover:bg-slate-300'
                        )}
                    />
                ))}
            </div>
        </section>
    )
}
