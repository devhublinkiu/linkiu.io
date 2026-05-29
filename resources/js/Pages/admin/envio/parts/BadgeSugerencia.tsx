import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/Components/ui/HoverCard'
import { InfoIcon } from 'lucide-react'

export interface Transportadora {
    nombre:        string
    logo:          string | null
    precio:        number
    tiempoMinutos: number
    score:         number
}

export interface SugerenciaCotizacion {
    transportadoras: Transportadora[]
    min:             number
    max:             number
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function formatDias(min: number): string {
    if (min <= 0) return '?'
    const dias = Math.round(min / 1440)
    return `${Math.max(1, dias)} día${dias === 1 ? '' : 's'}`
}

/**
 * Badge inline con el rango de costo sugerido para un destino.
 * Hover abre un tooltip con la tabla completa de transportadoras.
 */
export default function BadgeSugerencia({ data }: { data: SugerenciaCotizacion }) {
    const dias = data.transportadoras
        .map(t => t.tiempoMinutos)
        .filter(m => m > 0)
    const minDias = dias.length ? Math.min(...dias) : 0
    const maxDias = dias.length ? Math.max(...dias) : 0

    const labelDias = minDias === maxDias
        ? formatDias(minDias)
        : `${Math.round(minDias / 1440)}–${Math.round(maxDias / 1440)} días`

    return (
        <HoverCard openDelay={150}>
            <HoverCardTrigger asChild>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-700 cursor-help">
                    {formatPrecio(data.min)} – {formatPrecio(data.max)} · {labelDias}
                    <InfoIcon className="size-2.5 opacity-60" />
                </span>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="w-72 p-0">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-700">Sugerido por Mipaquete</p>
                    <p className="text-[10px] text-slate-500">Cotización contra capital del depto · paquete promedio configurado</p>
                </div>
                <div className="divide-y divide-slate-100">
                    {data.transportadoras.map((t, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2">
                            {t.logo && (
                                <img src={t.logo} alt={t.nombre} className="size-6 rounded shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-800 truncate">{t.nombre}</p>
                                <p className="text-[10px] text-slate-500">{formatDias(t.tiempoMinutos)} · {'★'.repeat(t.score)}</p>
                            </div>
                            <p className="text-xs font-semibold text-slate-900 shrink-0">{formatPrecio(t.precio)}</p>
                        </div>
                    ))}
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}
