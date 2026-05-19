import { getIcono } from '@/lib/iconos'

interface Sello { icono: string; titulo: string; sub: string }

interface Props {
    config: Record<string, unknown>
}

export default function SellosConfianza({ config }: Props) {
    const sellos = (config.sellos as Sello[] | undefined) ?? []
    const titulo = (config.titulo as string  | undefined) ?? ''
    if (sellos.length === 0) return null

    return (
        <section>
        {titulo && <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">{titulo}</h2>}
        <div className="grid grid-cols-3 gap-2">
            {sellos.map(({ icono, titulo, sub }, i) => {
                const Icon = getIcono(icono)
                return (
                    <div key={i} className="flex flex-col items-center gap-2 text-center p-3 rounded-lg bg-white border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-800 leading-tight">{titulo}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
                        </div>
                    </div>
                )
            })}
        </div>
        </section>
    )
}
