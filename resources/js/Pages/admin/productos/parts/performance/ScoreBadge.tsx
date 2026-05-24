import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { PerformanceDebug } from './types'

interface Props {
    score: number
    debug: PerformanceDebug
}

/**
 * Pill compacta con el score percentil del producto en el catálogo.
 * Color heat por banda (verde top, slate bottom). Hover muestra
 * descomposición + métodos de cálculo.
 */
export function ScoreBadge({ score, debug }: Props) {
    const [rect, setRect] = useState<DOMRect | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    const config =
        score >= 80 ? { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' } :
        score >= 60 ? { bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'ring-blue-200'    } :
        score >= 30 ? { bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200'   } :
                      { bg: 'bg-slate-100',  text: 'text-slate-600',   ring: 'ring-slate-200'   }

    function handleEnter() {
        if (ref.current) setRect(ref.current.getBoundingClientRect())
    }

    return (
        <div
            ref={ref}
            className="cursor-default w-12"
            onMouseEnter={handleEnter}
            onMouseLeave={() => setRect(null)}
        >
            <span className={`inline-flex items-center justify-center w-12 h-6 rounded-full text-xs font-bold ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}>
                {score}
            </span>

            {rect && createPortal(
                <div
                    className="fixed z-[9999] w-56 rounded-lg border border-slate-200 bg-white p-3 text-xs pointer-events-none shadow-sm"
                    style={{ top: rect.top - 8, left: rect.left, transform: 'translateY(-100%)' }}
                >
                    <p className="font-semibold text-slate-700 mb-2">
                        Score {score}/100
                        <span className="block font-normal text-slate-500 text-xs mt-0.5">
                            {debug.catalogo_pequeno
                                ? 'Catálogo chico — score directo'
                                : 'Percentil dentro del catálogo'}
                        </span>
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-slate-500">
                            <span>Conversion rate</span>
                            <span className="font-medium text-slate-700">
                                {(debug.conversion_rate * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Ventas totales</span>
                            <span className="font-medium text-slate-700">{debug.ventas_total}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Vistas 30d</span>
                            <span className="font-medium text-slate-700">{debug.vistas_30d}</span>
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    )
}
