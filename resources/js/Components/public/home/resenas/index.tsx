import { StarIcon } from 'lucide-react'

const RESENAS = [
    {
        nombre: 'María Fernanda L.',
        ciudad: 'Bogotá',
        estrellas: 5,
        texto: 'Increíble. Llevaba años usando tintes con amoníaco y siempre terminaba con el cabello reseco. Con SAVIA mis canas quedaron cubiertas y mi cabello se siente suave y sano. Nunca vuelvo al tinte tradicional.',
        iniciales: 'MF',
        color: 'bg-emerald-500',
    },
    {
        nombre: 'Valentina R.',
        ciudad: 'Medellín',
        estrellas: 5,
        texto: 'Me sorprendió lo fácil que es. Seguí los tres pasos del instructivo y desde la primera aplicación quedé feliz. El tono castaño quedó igualito a mi color natural.',
        iniciales: 'VR',
        color: 'bg-slate-600',
    },
    {
        nombre: 'Camila Torres',
        ciudad: 'Cali',
        estrellas: 5,
        texto: 'Lo probé con desconfianza porque nunca había creído en los tintes sin amoníaco. Ahora lo recomiendo a todas mis amigas. El resultado dura semanas y el cabello queda brillante.',
        iniciales: 'CT',
        color: 'bg-amber-500',
    },
    {
        nombre: 'Luisa Pedraza',
        ciudad: 'Bucaramanga',
        estrellas: 4,
        texto: 'Muy buena experiencia. La aplicación es sencilla y el olor es mucho más agradable que los tintes comunes. La cobertura en canas fue total. Le doy 5 estrellas al resultado y 4 al tiempo de espera.',
        iniciales: 'LP',
        color: 'bg-blue-500',
    },
    {
        nombre: 'Daniela M.',
        ciudad: 'Barranquilla',
        estrellas: 5,
        texto: 'Llevo 4 meses usando SAVIA y no pienso cambiar. Mi cabello está más fuerte, las canas no se ven y mi peluquera no puede creer que lo hago en casa.',
        iniciales: 'DM',
        color: 'bg-rose-500',
    },
    {
        nombre: 'Andrea Castillo',
        ciudad: 'Manizales',
        estrellas: 5,
        texto: 'Vale cada peso. Kit completo, incluye todo lo que necesitas, y el resultado es profesional. Ya hice mi segundo pedido y aproveché el descuento.',
        iniciales: 'AC',
        color: 'bg-violet-500',
    },
]

function Estrellas({ valor }: { valor: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                    key={i}
                    className={`w-3.5 h-3.5 ${i <= valor ? 'text-amber-500' : 'text-slate-200'}`}
                    fill="currentColor"
                />
            ))}
        </div>
    )
}

export default function Resenas() {
    return (
        <section className="bg-slate-50 py-16">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(i => (
                                <StarIcon key={i} className="w-5 h-5 text-amber-500" fill="currentColor" />
                            ))}
                        </div>
                        <span className="text-base font-semibold text-slate-900">4.7</span>
                        <span className="text-base text-slate-400">· 312 reseñas verificadas</span>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                        Ellas ya confían en SAVIA
                    </h2>
                    <p className="mt-3 text-lg text-slate-500 max-w-xl mx-auto">
                        Más de 1.200 clientas en todo el país comparten su experiencia.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {RESENAS.map(({ nombre, ciudad, estrellas, texto, iniciales, color }) => (
                        <div
                            key={nombre}
                            className="flex flex-col gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-md"
                        >
                            <Estrellas valor={estrellas} />
                            <p className="text-base text-slate-700 leading-relaxed flex-1">"{texto}"</p>
                            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                                <div className={`${color} w-9 h-9 rounded-full flex items-center justify-center shrink-0`}>
                                    <span className="text-white text-xs font-bold">{iniciales}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{nombre}</p>
                                    <p className="text-xs text-slate-400">{ciudad}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
