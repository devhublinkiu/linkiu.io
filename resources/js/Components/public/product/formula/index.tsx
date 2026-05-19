import { LeafIcon, XIcon, CheckIcon } from 'lucide-react'

const CONTIENE = [
    { nombre: 'Keratina vegetal',     beneficio: 'Fortalece y sella la fibra capilar'         },
    { nombre: 'Aceite de argán',      beneficio: 'Hidrata y da brillo sin pesar'               },
    { nombre: 'Proteína de soya',     beneficio: 'Repara el daño desde adentro'                },
    { nombre: 'Extracto de caléndula', beneficio: 'Calma el cuero cabelludo sensible'          },
]

const NO_CONTIENE = ['Amoníaco', 'Peróxido', 'Parabenos', 'Sulfatos', 'Siliconas', 'Colorantes artificiales']

export default function Formula() {
    return (
        <section>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
                La fórmula
            </h2>
            <p className="text-base text-slate-500 mb-8">
                Ingredientes con propósito. Sin relleno, sin atajos.
            </p>

            {/* Ingredientes activos */}
            <div className="rounded-xl overflow-hidden border border-emerald-100 mb-4">
                <div className="bg-emerald-500 px-5 py-3 flex items-center gap-2">
                    <LeafIcon className="w-4 h-4 text-white" />
                    <p className="text-sm font-bold text-white tracking-wide">INGREDIENTES ACTIVOS</p>
                </div>
                <div className="bg-emerald-50 divide-y divide-emerald-100">
                    {CONTIENE.map(({ nombre, beneficio }) => (
                        <div key={nombre} className="flex items-center gap-4 px-5 py-4">
                            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                <CheckIcon className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900">{nombre}</p>
                                <p className="text-xs text-slate-500">{beneficio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Libre de */}
            <div className="rounded-xl overflow-hidden border border-slate-200">
                <div className="bg-slate-800 px-5 py-3 flex items-center gap-2">
                    <XIcon className="w-4 h-4 text-slate-300" strokeWidth={2.5} />
                    <p className="text-sm font-bold text-slate-200 tracking-wide">LIBRE DE</p>
                </div>
                <div className="bg-white px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                        {NO_CONTIENE.map(item => (
                            <span key={item} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                                <XIcon className="w-3 h-3 text-red-400" strokeWidth={2.5} />
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
