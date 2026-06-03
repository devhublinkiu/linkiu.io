import { type ReactNode } from 'react'

interface Props {
    icono:     ReactNode
    label:     string
    valor:     string
    sublabel?: string
    color:     'blue' | 'emerald' | 'slate' | 'amber'
}

/**
 * Card para las 4 metricas principales del modulo Vista en tiempo real.
 * Acento de color por tipo siguiendo DESIGN.md (paleta permitida: slate,
 * gray, red, emerald, blue, amber, orange).
 */
export function EstadisticaCard({ icono, label, valor, sublabel, color }: Props) {
    const colorMap = {
        blue:    { bg: 'bg-blue-50',    text: 'text-blue-500',    label: 'text-blue-700' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500', label: 'text-emerald-700' },
        slate:   { bg: 'bg-slate-100',  text: 'text-slate-600',   label: 'text-slate-700' },
        amber:   { bg: 'bg-amber-50',   text: 'text-amber-500',   label: 'text-amber-700' },
    }
    const c = colorMap[color]

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
                <span className={`w-9 h-9 ${c.bg} ${c.text} rounded-lg flex items-center justify-center`}>
                    {icono}
                </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{valor}</p>
            {sublabel && <p className={`text-xs ${c.label} mt-1 font-medium`}>{sublabel}</p>}
        </div>
    )
}
