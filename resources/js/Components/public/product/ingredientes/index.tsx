import { LeafIcon, DropletIcon, SparklesIcon, FlowerIcon } from 'lucide-react'

const INGREDIENTES = [
    {
        icono: LeafIcon,
        nombre: 'Keratina vegetal',
        descripcion: 'Sella la cutícula y fortalece la fibra capilar desde la primera aplicación.',
        tags: ['Fortalecimiento', 'Anti-quiebre'],
        bg: 'bg-emerald-50',
        iconBg: 'bg-emerald-500',
        tagBg: 'bg-emerald-100 text-emerald-700',
    },
    {
        icono: DropletIcon,
        nombre: 'Aceite de argán',
        descripcion: 'Rico en vitamina E y ácidos grasos. Aporta brillo sin pesar ni engrasar.',
        tags: ['Brillo', 'Hidratación'],
        bg: 'bg-amber-50',
        iconBg: 'bg-amber-500',
        tagBg: 'bg-amber-100 text-amber-700',
    },
    {
        icono: SparklesIcon,
        nombre: 'Proteína de soya',
        descripcion: 'Penetra la corteza capilar y repara el daño acumulado por el calor y los químicos.',
        tags: ['Reparación', 'Nutrición'],
        bg: 'bg-blue-50',
        iconBg: 'bg-blue-500',
        tagBg: 'bg-blue-100 text-blue-700',
    },
    {
        icono: FlowerIcon,
        nombre: 'Extracto de caléndula',
        descripcion: 'Calma el cuero cabelludo sensible y reduce la irritación post-aplicación.',
        tags: ['Cuero cabelludo', 'Anti-irritante'],
        bg: 'bg-rose-50',
        iconBg: 'bg-rose-500',
        tagBg: 'bg-rose-100 text-rose-700',
    },
]

export default function Ingredientes() {
    return (
        <section className="py-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
                Ingredientes activos
            </h2>
            <p className="text-base text-slate-500 mb-8">
                Cada ingrediente tiene un propósito. Sin relleno, sin atajos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INGREDIENTES.map(({ icono: Icono, nombre, descripcion, tags, bg, iconBg, tagBg }) => (
                    <div key={nombre} className={`rounded-xl p-5 flex flex-col gap-4 ${bg}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                                <Icono className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-sm font-bold text-slate-900">{nombre}</p>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{descripcion}</p>
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                            {tags.map(tag => (
                                <span key={tag} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${tagBg}`}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
