const PASOS = [
    {
        numero: '01',
        titulo: 'Elige tu producto',
        descripcion: 'Explora nuestra línea y encuentra el producto ideal para ti. Cada uno está pensado para un resultado específico.',
        detalle: 'Catálogo siempre disponible',
    },
    {
        numero: '02',
        titulo: 'Recíbelo en casa',
        descripcion: 'Compra en línea de forma segura. Despachamos a todo el país y te notificamos en cada etapa del envío.',
        detalle: 'Envío gratis desde $89.900',
    },
    {
        numero: '03',
        titulo: 'Vive la diferencia',
        descripcion: 'Disfruta resultados reales desde la primera aplicación. Si no quedas satisfecha, te devolvemos tu dinero.',
        detalle: 'Satisfacción garantizada',
    },
]

export default function ComoFunciona() {
    return (
        <section className="bg-gray-50 py-16" id="como-funciona">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-14">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                        Comprar nunca fue tan fácil
                    </h2>
                    <p className="mt-4 text-xl text-slate-500 max-w-xl mx-auto">
                        De tu elección a tu puerta en tres pasos simples.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">

                    {/* Línea conectora desktop */}
                    <div className="hidden lg:block absolute top-10 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-slate-200" />

                    {PASOS.map(({ numero, titulo, descripcion, detalle }) => (
                        <div key={numero} className="relative flex flex-col items-center text-center gap-5">

                            {/* Número */}
                            <div className="relative z-10 w-20 h-20 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-md">
                                <span className="text-3xl font-bold text-slate-200 select-none">{numero}</span>
                            </div>

                            {/* Contenido */}
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-semibold text-slate-900">{titulo}</h3>
                                <p className="text-base text-slate-500 leading-relaxed max-w-xs mx-auto">{descripcion}</p>
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 mx-auto mt-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    {detalle}
                                </span>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
