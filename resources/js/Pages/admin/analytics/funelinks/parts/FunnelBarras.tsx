import { TrendingDown, AlertTriangle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import { cn } from '@/lib/utils'

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
 * Gráfico del funnel del producto. Cada sección es una barra horizontal con el
 * porcentaje de visitantes que llegaron. La sección con drop_off >= 15% se
 * marca como cuello (rojo + alerta) — el resto en emerald.
 *
 * Cada barra tiene tooltip con detalle al hover: cantidad absoluta, % del total,
 * y caída desde la sección anterior.
 */
export function FunnelBarras({ secciones }: Props) {
    if (secciones.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                Aún no hay sesiones registradas para mostrar el funnel.
            </div>
        )
    }

    return (
        <TooltipProvider delayDuration={200}>
            <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="mb-5">
                    <h3 className="text-sm font-semibold text-slate-900">Funnel del producto</h3>
                    <p className="text-xs text-slate-500 mt-0.5">% de visitantes que llegaron a cada sección. Pasa el cursor para ver el detalle.</p>
                </div>

                <div className="space-y-3.5">
                    {secciones.map((s, i) => {
                        const barClass    = s.es_cuello ? 'bg-red-500'           : 'bg-emerald-500'
                        const labelClass  = s.es_cuello ? 'text-red-700'          : 'text-slate-700'
                        const dropVisible = i > 0 && s.drop_off >= 5

                        return (
                            <Tooltip key={s.key}>
                                <TooltipTrigger asChild>
                                    <div className="cursor-default">
                                        <div className="flex items-center justify-between mb-1.5 text-xs">
                                            <span className={cn('font-medium inline-flex items-center gap-1', labelClass)}>
                                                {s.es_cuello && <AlertTriangle className="w-3 h-3" />}
                                                {s.nombre}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                {dropVisible && (
                                                    <span className={cn(
                                                        'inline-flex items-center gap-0.5',
                                                        s.es_cuello ? 'text-red-500' : 'text-slate-500',
                                                    )}>
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
                                                className={cn('h-full rounded-full transition-all duration-700', barClass)}
                                                style={{ width: `${s.porcentaje}%` }}
                                            />
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                    <div className="space-y-1 text-xs">
                                        <p className="font-semibold">{s.nombre}</p>
                                        <p>{s.count} visitantes llegaron ({s.porcentaje}% del total).</p>
                                        {i > 0 && (
                                            <p className={cn('font-medium', s.es_cuello && 'text-red-300')}>
                                                Caída desde la sección anterior: {s.drop_off}%
                                            </p>
                                        )}
                                        {s.es_cuello && (
                                            <p className="text-red-300 font-medium pt-1 border-t border-white/10">
                                                Este es el cuello del funnel — la mayor caída del recorrido.
                                            </p>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </div>
            </div>
        </TooltipProvider>
    )
}
