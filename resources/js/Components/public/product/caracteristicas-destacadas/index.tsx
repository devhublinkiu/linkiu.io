import { getIcono } from '@/lib/iconos'

interface Item { icono: string; titulo: string; descripcion: string }

interface Props {
    config: Record<string, unknown>
}

export default function CaracteristicasDestacadas({ config }: Props) {
    const items       = (config.items       as Item[]  | undefined) ?? []
    const titulo      = (config.titulo      as string  | undefined) ?? 'Características destacadas'
    const descripcion = (config.descripcion as string  | undefined) ?? ''

    if (items.length === 0) return null

    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{titulo}</h2>
            {descripcion && <p className="text-base text-slate-500 mb-6">{descripcion}</p>}
            {!descripcion && <div className="mb-6" />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(({ icono, titulo: t, descripcion: desc }, i) => {
                    const Icon = getIcono(icono ?? 'star')
                    return (
                        <div key={i} className="rounded-xl p-5 flex flex-col gap-4 bg-emerald-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <p className="text-sm font-bold text-slate-900">{t}</p>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
