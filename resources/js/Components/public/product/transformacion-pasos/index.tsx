interface Paso {
    titulo:      string
    descripcion: string
}

interface Props {
    config: Record<string, unknown>
}

/**
 * Variante visual de Cómo Funciona: grid de tarjetas con número grande arriba,
 * sin línea conectora vertical. Mismo shape de config (titulo, descripcion, pasos).
 */
export default function TransformacionPasos({ config }: Props) {
    const pasos       = (config.pasos       as Paso[] | undefined) ?? []
    const titulo      = (config.titulo      as string | undefined) ?? 'Tu transformación'
    const descripcion = (config.descripcion as string | undefined) ?? ''

    if (pasos.length === 0) return null

    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{titulo}</h2>
            {descripcion && <p className="text-base text-slate-500 mb-6">{descripcion}</p>}
            {!descripcion && <div className="mb-6" />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pasos.map(({ titulo: t, descripcion: desc }, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4">
                            <span className="text-white font-bold text-sm">{String(i + 1).padStart(2, '0')}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1.5">{t}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
