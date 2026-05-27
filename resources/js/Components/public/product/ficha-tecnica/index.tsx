import { CheckIcon, XIcon } from 'lucide-react'

interface Spec { nombre: string; valor: string }

interface Props {
    config: Record<string, unknown>
}

export default function FichaTecnica({ config }: Props) {
    const specs     = (config.specs    as Spec[]   | undefined) ?? []
    const sinLista  = (config.sin_lista as string[] | undefined) ?? []
    const titulo    = (config.titulo   as string   | undefined) ?? 'Ficha técnica'
    const descripcion = (config.descripcion as string | undefined) ?? ''

    if (specs.length === 0 && sinLista.length === 0) return null

    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{titulo}</h2>
            {descripcion && <p className="text-base text-slate-500 mb-6">{descripcion}</p>}
            {!descripcion && <div className="mb-6" />}

            {specs.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-emerald-100 mb-4">
                    <div className="bg-emerald-50 divide-y divide-emerald-100">
                        {specs.map(({ nombre, valor }) => (
                            <div key={nombre} className="flex items-center gap-4 px-5 py-4">
                                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                    <CheckIcon className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">{nombre}</p>
                                    <p className="text-xs text-slate-500">{valor}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {sinLista.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                    <div className="bg-white px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                            {sinLista.map(item => (
                                <span key={item} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                                    <XIcon className="w-3 h-3 text-red-400" strokeWidth={2.5} />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
