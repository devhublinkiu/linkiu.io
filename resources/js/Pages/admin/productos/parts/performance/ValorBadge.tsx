import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { PerformanceDebug } from './types'

interface Props {
    valor:      number | null   // percentil 0-100 dentro del catalogo, null si sin ventas 7d
    revenue7d:  number          // monto crudo en pesos
    debug:      PerformanceDebug
}

/**
 * Pill compacta con el revenue 7d formateado + percentil en tooltip.
 * Mide cuanto $$$ genera el producto vs el catalogo — dimension distinta
 * a "cuanto vende" (Temperatura) y "que tan bien convierte" (Score).
 * Si revenue=0, muestra "—" + tooltip "Sin ventas en 7d".
 */
export function ValorBadge({ valor, revenue7d, debug }: Props) {
    const [rect, setRect] = useState<DOMRect | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    function handleEnter() {
        if (ref.current) setRect(ref.current.getBoundingClientRect())
    }

    if (valor === null) {
        return (
            <div
                ref={ref}
                className="cursor-default w-12"
                onMouseEnter={handleEnter}
                onMouseLeave={() => setRect(null)}
            >
                <span className="inline-flex items-center justify-center w-12 h-6 rounded-full text-xs font-bold ring-1 ring-inset bg-slate-50 text-slate-400 ring-slate-200">
                    —
                </span>

                {rect && createPortal(
                    <div
                        className="fixed z-[9999] w-56 rounded-lg border border-slate-200 bg-white p-3 text-xs pointer-events-none shadow-sm"
                        style={{ top: rect.top - 8, left: rect.left, transform: 'translateY(-100%)' }}
                    >
                        <p className="font-semibold text-slate-700 mb-2">
                            Sin ventas en 7d
                            <span className="block font-normal text-slate-500 text-xs mt-0.5">
                                No hay revenue para comparar
                            </span>
                        </p>
                    </div>,
                    document.body,
                )}
            </div>
        )
    }

    const config =
        valor >= 80 ? { bg: 'bg-violet-100', text: 'text-violet-800', ring: 'ring-violet-300' } :
        valor >= 60 ? { bg: 'bg-violet-50',  text: 'text-violet-700', ring: 'ring-violet-200' } :
        valor >= 30 ? { bg: 'bg-slate-100',  text: 'text-slate-700',  ring: 'ring-slate-200'  } :
                      { bg: 'bg-slate-50',   text: 'text-slate-500',  ring: 'ring-slate-200'  }

    return (
        <div
            ref={ref}
            className="cursor-default w-14"
            onMouseEnter={handleEnter}
            onMouseLeave={() => setRect(null)}
        >
            <span className={`inline-flex items-center justify-center w-14 h-6 rounded-full text-xs font-bold ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}>
                {formatCompacto(revenue7d)}
            </span>

            {rect && createPortal(
                <div
                    className="fixed z-[9999] w-56 rounded-lg border border-slate-200 bg-white p-3 text-xs pointer-events-none shadow-sm"
                    style={{ top: rect.top - 8, left: rect.left, transform: 'translateY(-100%)' }}
                >
                    <p className="font-semibold text-slate-700 mb-2">
                        Revenue 7d {formatFull(revenue7d)}
                        <span className="block font-normal text-slate-500 text-xs mt-0.5">
                            P{valor} del catálogo{debug.catalogo_pequeno ? ' (chico, baja resolución)' : ''}
                        </span>
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-slate-500">
                            <span>Ventas 7d</span>
                            <span className="font-medium text-slate-700">{debug.ventas_7d}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Ticket promedio</span>
                            <span className="font-medium text-slate-700">
                                {debug.ventas_7d > 0
                                    ? formatFull(Math.round(revenue7d / debug.ventas_7d))
                                    : '—'}
                            </span>
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    )
}

// Formato compacto para la pill: $1.2M, $85k, $999.
function formatCompacto(monto: number): string {
    if (monto >= 1_000_000) {
        const m = monto / 1_000_000
        return `$${m.toFixed(m >= 10 ? 0 : 1)}M`
    }
    if (monto >= 1_000) {
        const k = monto / 1_000
        return `$${k.toFixed(k >= 10 ? 0 : 1)}k`
    }
    return `$${monto}`
}

// Formato completo para el tooltip: $1.234.567.
function formatFull(monto: number): string {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(monto)
}
