import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { PerformanceDebug } from './types'

interface Props {
    score:         number | null   // percentil 0-100 dentro del catalogo, null = sin data
    conversionPct: number | null   // % crudo de conversion para mostrar
    debug:         PerformanceDebug
}

/**
 * Pill compacta con el percentil del producto en el catalogo + tooltip
 * con el % crudo de conversion. Si vistas insuficientes (score null),
 * muestra "—" + tooltip "Sin data".
 */
export function ScoreBadge({ score, conversionPct, debug }: Props) {
    const [rect, setRect] = useState<DOMRect | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    function handleEnter() {
        if (ref.current) setRect(ref.current.getBoundingClientRect())
    }

    // Sin data — pill gris y tooltip explicativo
    if (score === null) {
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
                            Sin data
                            <span className="block font-normal text-slate-500 text-xs mt-0.5">
                                Necesita ≥50 vistas/7d para Score confiable
                            </span>
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-slate-500">
                                <span>Vistas 7d</span>
                                <span className="font-medium text-slate-700">{debug.vistas_7d}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>Ventas 7d</span>
                                <span className="font-medium text-slate-700">{debug.ventas_7d}</span>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
            </div>
        )
    }

    const config =
        score >= 80 ? { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' } :
        score >= 60 ? { bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'ring-blue-200'    } :
        score >= 30 ? { bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200'   } :
                      { bg: 'bg-slate-100',  text: 'text-slate-600',   ring: 'ring-slate-200'   }

    return (
        <div
            ref={ref}
            className="cursor-default w-12"
            onMouseEnter={handleEnter}
            onMouseLeave={() => setRect(null)}
        >
            <span className={`inline-flex items-center justify-center w-12 h-6 rounded-full text-xs font-bold ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}>
                {conversionPct !== null ? `${conversionPct}%` : score}
            </span>

            {rect && createPortal(
                <div
                    className="fixed z-[9999] w-56 rounded-lg border border-slate-200 bg-white p-3 text-xs pointer-events-none shadow-sm"
                    style={{ top: rect.top - 8, left: rect.left, transform: 'translateY(-100%)' }}
                >
                    <p className="font-semibold text-slate-700 mb-2">
                        Conversión {conversionPct !== null ? `${conversionPct}%` : '—'}
                        <span className="block font-normal text-slate-500 text-xs mt-0.5">
                            P{score} del catálogo{debug.catalogo_pequeno ? ' (chico, baja resolución)' : ''}
                        </span>
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-slate-500">
                            <span>Ventas 7d</span>
                            <span className="font-medium text-slate-700">{debug.ventas_7d}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Vistas 7d</span>
                            <span className="font-medium text-slate-700">{debug.vistas_7d}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Ventas totales</span>
                            <span className="font-medium text-slate-700">{debug.ventas_total}</span>
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    )
}
