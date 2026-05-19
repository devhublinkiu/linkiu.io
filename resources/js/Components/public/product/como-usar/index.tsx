import { ShowerHeadIcon, PaintbrushIcon, TimerIcon } from 'lucide-react'

const PASOS = [
    {
        numero: '01',
        icono: ShowerHeadIcon,
        titulo: 'Prepara tu cabello',
        descripcion: 'Lava con tu shampoo habitual y seca con toalla hasta que quede húmedo. No apliques acondicionador antes — impide que el color se adhiera.',
        nota: 'Cabello limpio y húmedo · 5 min',
        color: 'bg-blue-500',
    },
    {
        numero: '02',
        icono: PaintbrushIcon,
        titulo: 'Mezcla y aplica',
        descripcion: 'Vierte el activador en el recipiente de color y mezcla hasta homogeneizar. Aplica sección por sección desde la raíz hacia las puntas, cubriendo bien las zonas con más canas.',
        nota: 'Incluye aplicador y guantes · 10 min',
        color: 'bg-emerald-500',
    },
    {
        numero: '03',
        icono: TimerIcon,
        titulo: 'Espera y enjuaga',
        descripcion: 'Cubre con la gorra incluida y deja actuar 45–60 minutos. Enjuaga con agua tibia hasta que salga clara y aplica el acondicionador post-color por 3 minutos.',
        nota: 'Resultado visible desde la primera vez',
        color: 'bg-amber-500',
    },
]

export default function ComoUsar() {
    return (
        <section>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
                Cómo usarlo
            </h2>
            <p className="text-base text-slate-500 mb-8">
                Tres pasos. Una hora. Resultado desde casa.
            </p>

            <div className="flex flex-col gap-0">
                {PASOS.map(({ numero, icono: Icono, titulo, descripcion, nota, color }, i) => (
                    <div key={numero} className="flex gap-5">

                        {/* Timeline */}
                        <div className="flex flex-col items-center shrink-0">
                            <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center shadow-sm`}>
                                <Icono className="w-5 h-5 text-white" />
                            </div>
                            {i < PASOS.length - 1 && (
                                <div className="w-px flex-1 bg-slate-200 my-1" />
                            )}
                        </div>

                        {/* Contenido */}
                        <div className={`flex-1 pb-8 ${i === PASOS.length - 1 ? 'pb-0' : ''}`}>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs font-bold text-slate-300 tracking-widest">{numero}</span>
                                <h3 className="text-base font-bold text-slate-900">{titulo}</h3>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed mb-3">{descripcion}</p>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                {nota}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
