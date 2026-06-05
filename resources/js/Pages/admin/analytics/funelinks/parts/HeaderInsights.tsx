import { Sparkles, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Insight {
    tipo:    'campana_top' | 'cuello' | 'tendencia'
    titulo:  string
    detalle: string
    estado:  'bueno' | 'medio' | 'bajo'
}

interface Props {
    insights: Insight[]
}

const ESTADO_STYLE: Record<Insight['estado'], string> = {
    bueno: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    medio: 'bg-amber-50 border-amber-200 text-amber-900',
    bajo:  'bg-red-50 border-red-200 text-red-900',
}

const ESTADO_ICON_COLOR: Record<Insight['estado'], string> = {
    bueno: 'text-emerald-600',
    medio: 'text-amber-600',
    bajo:  'text-red-600',
}

function IconoPorTipo({ tipo, className }: { tipo: Insight['tipo']; className?: string }) {
    if (tipo === 'campana_top') return <Sparkles className={className} />
    if (tipo === 'cuello')      return <AlertTriangle className={className} />
    return <TrendingUp className={className} />
}

/**
 * Banner con 1-3 insights destacados arriba del dashboard de Funelinks.
 * Resume lo que el admin debe atender primero: mejor campaña, cuello del funnel,
 * tendencia de conversión. Vacío hasta que haya datos.
 */
export function HeaderInsights({ insights }: Props) {
    if (insights.length === 0) return null

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((ins, i) => {
                const Icon = ins.tipo === 'tendencia' && ins.titulo.startsWith('Conversión baja')
                    ? TrendingDown
                    : null
                return (
                    <div
                        key={i}
                        className={cn(
                            'rounded-lg border p-4 flex items-start gap-3',
                            ESTADO_STYLE[ins.estado],
                        )}
                    >
                        <div className={cn('shrink-0 mt-0.5', ESTADO_ICON_COLOR[ins.estado])}>
                            {Icon ? <Icon className="w-4 h-4" /> : <IconoPorTipo tipo={ins.tipo} className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-tight">{ins.titulo}</p>
                            <p className="text-xs opacity-80 mt-0.5 leading-snug">{ins.detalle}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
