import { getIcono } from '@/lib/iconos'

interface Props {
    config: Record<string, unknown>
}

export default function Garantia({ config }: Props) {
    const titulo      = (config.titulo      as string | undefined)
    const descripcion = (config.descripcion as string | undefined)
    const icono       = (config.icono       as string | undefined) ?? 'shield-check'

    if (!titulo) return null

    const Icon = getIcono(icono)

    return (
        <section>
            <div className="bg-slate-900 rounded-lg px-8 py-8 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white leading-tight mb-3 whitespace-pre-line">
                        {titulo}
                    </h3>
                    {descripcion && (
                        <p className="text-base text-slate-400 max-w-sm mx-auto leading-relaxed">
                            {descripcion}
                        </p>
                    )}
                </div>
            </div>
        </section>
    )
}
