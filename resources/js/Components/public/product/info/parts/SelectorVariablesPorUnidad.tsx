import type { VariableGrupo, VariableItem } from '@/Pages/public/Product'
import { cn } from '@/lib/utils'
import SelectorVariables from './SelectorVariables'

interface Props {
    grupos:        VariableGrupo[]
    cantidad:      number
    unidad:        string
    seleccionados: Record<number, VariableItem>[]
    onChange:      (unitIndex: number, grupoId: number, item: VariableItem) => void
}

export default function SelectorVariablesPorUnidad({ grupos, cantidad, unidad, seleccionados, onChange }: Props) {
    if (grupos.length === 0) return null

    const multi = cantidad > 1

    return (
        <div className="flex flex-col gap-3">
            {multi && (
                <p className="text-sm font-semibold text-slate-700">Personaliza cada {unidad.toLowerCase()}</p>
            )}
            {Array.from({ length: cantidad }, (_, i) => (
                <div key={i} className={cn('flex flex-col gap-2', multi && i > 0 && 'pt-3 border-t border-slate-100')}>
                    {multi && (
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            {unidad} {i + 1}
                        </p>
                    )}
                    <SelectorVariables
                        grupos={grupos}
                        seleccionados={seleccionados[i] ?? {}}
                        onChange={(grupoId, item) => onChange(i, grupoId, item)}
                    />
                </div>
            ))}
        </div>
    )
}
