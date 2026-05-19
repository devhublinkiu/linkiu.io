interface Paso {
    titulo:      string
    descripcion: string
}

interface Props {
    config: Record<string, unknown>
}

export default function ComoFunciona({ config }: Props) {
    const pasos       = (config.pasos       as Paso[] | undefined) ?? []
    const titulo      = (config.titulo      as string | undefined) ?? 'Cómo funciona'
    const descripcion = (config.descripcion as string | undefined) ?? ''

    if (pasos.length === 0) return null

    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{titulo}</h2>
            {descripcion && <p className="text-base text-slate-500 mb-6">{descripcion}</p>}
            {!descripcion && <div className="mb-6" />}

            <div className="flex flex-col">
                {pasos.map(({ titulo: t, descripcion: desc }, i) => (
                    <div key={i} className="flex gap-5">
                        <div className="flex flex-col items-center shrink-0">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0">
                                <span className="text-white font-bold text-sm">{String(i + 1).padStart(2, '0')}</span>
                            </div>
                            {i < pasos.length - 1 && <div className="w-px flex-1 bg-emerald-100 my-1" />}
                        </div>

                        <div className={`flex-1 ${i < pasos.length - 1 ? 'pb-8' : 'pb-0'}`}>
                            <h3 className="text-base font-bold text-slate-900 mb-1.5">{t}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
