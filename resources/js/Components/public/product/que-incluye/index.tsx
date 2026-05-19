import { getIcono } from '@/lib/iconos'

interface Item { icono?: string; texto: string }

interface Props {
    config: Record<string, unknown>
}

export default function QueIncluye({ config }: Props) {
    const items  = (config.items  as Item[]  | undefined) ?? []
    const titulo = (config.titulo as string  | undefined) || 'Kit completo incluye'
    if (items.length === 0) return null

    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">{titulo}</h2>
            <div className="grid grid-cols-2 gap-2">
                {items.map(({ icono, texto }, i) => {
                    const Icon = getIcono(icono ?? 'check')
                    return (
                        <div key={i} className="flex items-center gap-3 bg-white border border-slate-100 rounded-lg px-3 py-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                <Icon className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <span className="text-xs font-medium text-slate-700 leading-tight">{texto}</span>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
