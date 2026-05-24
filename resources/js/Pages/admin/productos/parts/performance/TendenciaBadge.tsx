import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import type { Tendencia } from './types'

interface Props {
    tendencia: Tendencia
    // Datos crudos para contexto en tooltip. Vienen del debug del snapshot.
    ventas_actual?:    number
    ventas_baseline?:  number
}

/**
 * Icono + % de cambio. Si dirección es 'neutral' (incluye el `sin_dato`
 * mapeado por el controller) muestra `—`, evitando ruido en productos
 * con muy poco volumen donde cualquier % sería espurio.
 *
 * Tooltip enriquecido con números crudos: "8 esta semana vs prom. 4
 * semanas: 5 (+60%)".
 */
export function TendenciaBadge({ tendencia, ventas_actual, ventas_baseline }: Props) {
    const [rect, setRect] = useState<DOMRect | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    function handleEnter() {
        if (ref.current) setRect(ref.current.getBoundingClientRect())
    }

    const config =
        tendencia.direccion === 'up'
            ? { icon: TrendingUp,   color: 'text-emerald-700', sign: '+' }
            : tendencia.direccion === 'down'
            ? { icon: TrendingDown, color: 'text-red-500',     sign: '-' }
            : null

    return (
        <div
            ref={ref}
            className="inline-flex items-center cursor-default"
            onMouseEnter={handleEnter}
            onMouseLeave={() => setRect(null)}
        >
            {config ? (
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${config.color}`}>
                    <config.icon className="size-3.5" />
                    {tendencia.pct > 0 ? `${config.sign}${tendencia.pct}%` : ''}
                </span>
            ) : (
                <Minus className="size-3.5 text-slate-300" />
            )}

            {rect && createPortal(
                <div
                    className="fixed z-[9999] w-52 rounded-lg border border-slate-200 bg-white p-3 text-xs pointer-events-none shadow-sm"
                    style={{ top: rect.top - 8, left: rect.left, transform: 'translateY(-100%)' }}
                >
                    <p className="font-semibold text-slate-700 mb-1">
                        Tendencia
                    </p>
                    {config && ventas_actual !== undefined && ventas_baseline !== undefined ? (
                        <p className="text-slate-500 leading-relaxed">
                            <span className="font-medium text-slate-700">{ventas_actual}</span> esta semana
                            vs prom. 4 semanas previas:{' '}
                            <span className="font-medium text-slate-700">{ventas_baseline}</span>
                            <span className={`ml-1 ${config.color} font-medium`}>
                                ({config.sign}{tendencia.pct}%)
                            </span>
                        </p>
                    ) : (
                        <p className="text-slate-500 leading-relaxed">
                            Volumen insuficiente para detectar tendencia (&lt;1 venta/sem en promedio).
                        </p>
                    )}
                </div>,
                document.body,
            )}
        </div>
    )
}
