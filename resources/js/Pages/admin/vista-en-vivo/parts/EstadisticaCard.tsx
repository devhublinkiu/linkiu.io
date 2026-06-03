import { type ReactNode } from 'react'

type Color = 'blue' | 'emerald' | 'slate' | 'amber'

interface PropsBase {
    icono:     ReactNode
    label:     string
    color:     Color
}

interface PropsValor extends PropsBase {
    valor:     string
    sublabel?: string
    stats?:    never
}

interface PropsStats extends PropsBase {
    valor?:    never
    sublabel?: never
    stats:     { valor: string | number; etiqueta: string }[]
}

type Props = PropsValor | PropsStats

const COLOR_MAP: Record<Color, { bg: string; text: string; label: string }> = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-500',    label: 'text-blue-700' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500', label: 'text-emerald-700' },
    slate:   { bg: 'bg-slate-100',  text: 'text-slate-600',   label: 'text-slate-700' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-500',   label: 'text-amber-700' },
}

/**
 * Card para las metricas principales del modulo Vista en tiempo real.
 * Dos variantes: valor unico (con sublabel) o mini timeline con varios stats.
 * Sigue paleta DESIGN.md.
 */
export function EstadisticaCard(props: Props) {
    const c = COLOR_MAP[props.color]

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{props.label}</span>
                <span className={`w-9 h-9 ${c.bg} ${c.text} rounded-lg flex items-center justify-center`}>
                    {props.icono}
                </span>
            </div>

            {'stats' in props && props.stats ? (
                <div className="grid grid-cols-3 gap-3 divide-x divide-slate-100">
                    {props.stats.map((s, i) => (
                        <div key={i} className={i === 0 ? '' : 'pl-3'}>
                            <p className="text-2xl font-bold text-slate-900 leading-tight">{s.valor}</p>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium leading-tight">{s.etiqueta}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <p className="text-2xl font-bold text-slate-900">{props.valor}</p>
                    {props.sublabel && <p className={`text-xs ${c.label} mt-1 font-medium`}>{props.sublabel}</p>}
                </>
            )}
        </div>
    )
}
