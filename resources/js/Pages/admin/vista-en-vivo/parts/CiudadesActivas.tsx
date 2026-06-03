import { MapPin } from 'lucide-react'

interface Ciudad {
    ciudad: string
    count:  number
}

interface Props {
    ciudades: Ciudad[]
}

/**
 * Lista de ciudades con count de visitantes únicos en las últimas 4 horas.
 * Sin mapa visual — esa es una mejora para v2.
 */
export function CiudadesActivas({ ciudades }: Props) {
    const maxCount = ciudades[0]?.count ?? 1

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 h-full">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <MapPin className="size-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">Ciudades activas</h3>
                <span className="text-xs text-slate-500 ml-auto">conectadas ahora</span>
            </div>

            {ciudades.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Sin actividad aún</p>
            ) : (
                <div className="space-y-2.5">
                    {ciudades.map((c) => (
                        <div key={c.ciudad}>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700">{c.ciudad}</span>
                                <span className="text-slate-500">{c.count}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-sky-400 rounded-full transition-all duration-500"
                                    style={{ width: `${(c.count / maxCount) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
