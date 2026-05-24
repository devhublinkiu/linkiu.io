import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { PerformanceDebug } from './types'

interface Props {
    score: number  // temperatura 0-100
    debug: PerformanceDebug
}

/**
 * Barra horizontal compacta + label de banda. Tooltip enriquecido
 * muestra benchmarks del catálogo (p75) y conversion para que el
 * admin entienda DE DÓNDE viene el número.
 */
export function Temperatura({ score, debug }: Props) {
    const [rect, setRect] = useState<DOMRect | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    const config =
        score >= 70 ? { color: 'bg-emerald-500', text: 'text-emerald-700', label: 'Caliente', bg: 'bg-emerald-50' } :
        score >= 40 ? { color: 'bg-amber-400',   text: 'text-amber-700',   label: 'Tibio',    bg: 'bg-amber-50'   } :
        score >= 15 ? { color: 'bg-slate-300',   text: 'text-slate-600',   label: 'Frío',     bg: 'bg-slate-100'  } :
                      { color: 'bg-slate-200',   text: 'text-slate-500',   label: 'Helado',   bg: 'bg-slate-100'  }

    function handleEnter() {
        if (ref.current) setRect(ref.current.getBoundingClientRect())
    }

    return (
        <div
            ref={ref}
            className="flex flex-col gap-1 w-24 cursor-default"
            onMouseEnter={handleEnter}
            onMouseLeave={() => setRect(null)}
        >
            <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${config.text}`}>{score}</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                    {config.label}
                </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${config.color}`}
                    style={{ width: `${score}%` }}
                />
            </div>

            {rect && createPortal(
                <div
                    className="fixed z-[9999] w-56 rounded-lg border border-slate-200 bg-white p-3 text-xs pointer-events-none shadow-sm"
                    style={{ top: rect.top - 8, left: rect.left, transform: 'translateY(-100%)' }}
                >
                    <p className="font-semibold text-slate-700 mb-2">
                        Temperatura {score}/100
                        <span className="block font-normal text-slate-500 text-xs mt-0.5">
                            Calibrada al p75 del catálogo activo
                        </span>
                    </p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-slate-500">
                            <span>Ventas 7d</span>
                            <span className="font-medium text-slate-700">
                                {debug.ventas_7d}
                                <span className="text-slate-400 ml-1">/ {debug.p75_ventas_7d}</span>
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Vistas 7d</span>
                            <span className="font-medium text-slate-700">
                                {debug.vistas_7d}
                                <span className="text-slate-400 ml-1">/ {debug.p75_vistas_7d}</span>
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Conversion</span>
                            <span className="font-medium text-slate-700">
                                {(debug.conversion_rate * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Scroll prom.</span>
                            <span className="font-medium text-slate-700">{debug.scroll_promedio}%</span>
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    )
}
