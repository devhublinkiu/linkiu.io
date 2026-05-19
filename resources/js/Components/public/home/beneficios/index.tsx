import { LeafIcon, ShieldCheckIcon, MapPinIcon, TruckIcon } from 'lucide-react'

const BENEFICIOS = [
    {
        icono: LeafIcon,
        titulo: 'Fórmulas naturales',
        descripcion: 'Productos libres de amoníaco y peróxido agresivo. Cuidamos tu cabello con cada aplicación.',
    },
    {
        icono: MapPinIcon,
        titulo: 'Hecho en Colombia',
        descripcion: 'Formulados y producidos en Colombia con ingredientes botánicos de origen local.',
    },
    {
        icono: TruckIcon,
        titulo: 'Envío a todo el país',
        descripcion: 'Despachamos a cualquier ciudad de Colombia. Envío gratis en pedidos desde $89.900.',
    },
    {
        icono: ShieldCheckIcon,
        titulo: 'Satisfacción garantizada',
        descripcion: 'Si no quedas satisfecha, te devolvemos tu dinero. Sin preguntas, sin complicaciones.',
    },
]

export default function Beneficios() {
    return (
        <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-6">

                <div className="mb-12">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                        Una marca que se preocupa por ti
                    </h2>
                    <p className="mt-4 text-xl text-slate-500 max-w-2xl">
                        Detrás de cada producto hay un compromiso real con tu cabello y tu experiencia.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {BENEFICIOS.map(({ icono: Icono, titulo, descripcion }) => (
                        <div
                            key={titulo}
                            className="group flex flex-col gap-4 border border-slate-200 rounded-lg p-8 hover:border-emerald-200 hover:shadow-md transition-all duration-200 ease-in-out"
                        >
                            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-200 ease-in-out">
                                <Icono className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-900 mb-1">{titulo}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{descripcion}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
