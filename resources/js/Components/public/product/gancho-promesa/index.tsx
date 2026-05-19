import { getIcono } from '@/lib/iconos'
import { cn } from '@/lib/utils'

interface Stat { icono?: string; valor: string; sub: string }

interface Props {
    config: Record<string, unknown>
}

export default function GanchoPromesa({ config }: Props) {
    const dolor       = (config.dolor       as string | undefined) ?? ''
    const promesa     = (config.promesa     as string | undefined) ?? ''
    const descripcion = (config.descripcion as string | undefined) ?? ''
    const stats       = (config.stats       as Stat[] | undefined) ?? []

    if (!promesa) return null

    return (
        <section className="bg-gradient-to-b from-slate-950 to-slate-900 py-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-8">

                {/* Dolor */}
                {dolor && (
                    <p className="text-sm text-slate-400 italic max-w-xl leading-relaxed">
                        "{dolor}"
                    </p>
                )}

                {/* Separador rombo */}
                <div className="flex items-center gap-3">
                    <div className="h-px w-10 bg-emerald-500/30" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-emerald-500 shrink-0" />
                    <div className="h-px w-10 bg-emerald-500/30" />
                </div>

                {/* Promesa */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-[1.1] max-w-2xl whitespace-pre-line">
                    {promesa}
                </h2>

                {/* Descripción */}
                {descripcion && (
                    <p className="text-sm text-slate-400 max-w-md leading-relaxed -mt-2">
                        {descripcion}
                    </p>
                )}

                {/* Stats */}
                {stats.length > 0 && (
                    <div className="flex w-full max-w-lg mt-2">
                        {stats.map(({ icono, valor, sub }, i) => {
                            const Icon = getIcono(icono ?? 'star')
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        'flex flex-col items-center gap-1.5 px-6 py-5 flex-1',
                                        i < stats.length - 1 && 'border-r border-slate-700/50'
                                    )}
                                >
                                    <Icon className="w-6 h-6 text-emerald-400/70 mb-0.5" />
                                    <p className="text-sm font-black text-white tabular-nums leading-none">
                                        {valor}
                                    </p>
                                    <p className="text-xs text-slate-500 leading-tight">{sub}</p>
                                </div>
                            )
                        })}
                    </div>
                )}

            </div>
        </section>
    )
}
