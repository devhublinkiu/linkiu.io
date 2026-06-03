import { TrendingDown } from 'lucide-react'

export interface SeccionFunnel {
    key:        string
    nombre:     string
    count:      number
    porcentaje: number
    drop_off:   number
    es_cuello:  boolean
}

interface Props {
    secciones: SeccionFunnel[]
}

/**
 * Gráfico del funnel del producto: por cada sección del recorrido,
 * una barra horizontal con la cantidad/porcentaje de visitantes que
 * llegaron + indicador de caída desde la sección previa.
 *
 * La sección con mayor drop_off (>=15%) se destaca como cuello (rojo).
 */
export function FunnelBarras({ secciones }: Props) {
    if (secciones.length === 0) {
        return (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                Aún no hay sesiones registradas para mostrar el funnel.
            </div>
        )
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Funnel del producto</h3>

            <div className="space-y-4">
                {secciones.map((s, i) => {
                    const barClass = s.es_cuello ? 'bg-red-500' : 'bg-emerald-500'
                    const dropVisible = i > 0 && s.drop_off >= 5

                    return (
                        <div key={s.key}>
                            <div className="flex items-center justify-between mb-1.5 text-xs">
                                <span className={`font-medium ${s.es_cuello ? 'text-red-700' : 'text-slate-700'}`}>
                                    {s.nombre}
                                </span>
                                <div className="flex items-center gap-3">
                                    {dropVisible && (
                                        <span className="inline-flex items-center gap-0.5 text-slate-500">
                                            <TrendingDown className="w-3 h-3" />
                                            {s.drop_off}%
                                        </span>
                                    )}
                                    <span className="font-semibold text-slate-900 tabular-nums">
                                        {s.count} <span className="font-normal text-slate-500">({s.porcentaje}%)</span>
                                    </span>
                                </div>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                                    style={{ width: `${s.porcentaje}%` }}
                                />
                            </div>
                            {s.es_cuello && (
                                <p className="text-xs text-red-600 mt-1 font-medium">
                                    Cuello del funnel — la mayor caída del recorrido
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
