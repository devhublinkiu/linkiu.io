import { cn } from '@/lib/utils'
import type { VariableGrupo, VariableItem } from '@/Pages/public/Product'

interface Props {
    grupos:        VariableGrupo[]
    seleccionados: Record<number, VariableItem>
    onChange:      (grupoId: number, item: VariableItem) => void
}

export default function SelectorVariables({ grupos, seleccionados, onChange }: Props) {
    if (grupos.length === 0) return null

    return (
        <>
            {grupos.map(grupo => (
                <div key={grupo.id}>
                    <p className="text-sm font-semibold text-slate-700 mb-2">
                        {grupo.nombre}:&nbsp;
                        <span className="font-normal text-slate-500">{seleccionados[grupo.id]?.nombre}</span>
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        {grupo.items.map(item => {
                            const activo = seleccionados[grupo.id]?.id === item.id

                            if (grupo.tipo === 'color') return (
                                <button
                                    key={item.id}
                                    onClick={() => onChange(grupo.id, item)}
                                    title={item.nombre}
                                    className={cn(
                                        'w-6 h-6 rounded-full transition-all duration-200 ease-in-out',
                                        activo
                                            ? 'ring-2 ring-slate-900 ring-offset-2'
                                            : 'ring-1 ring-transparent hover:ring-slate-300 hover:ring-offset-1'
                                    )}
                                    style={{ backgroundColor: item.valor ?? '#ccc' }}
                                />
                            )

                            if (grupo.tipo === 'imagen') return (
                                <button
                                    key={item.id}
                                    onClick={() => onChange(grupo.id, item)}
                                    title={item.nombre}
                                    className={cn(
                                        'w-9 h-9 rounded-lg overflow-hidden transition-all duration-200 ease-in-out',
                                        activo
                                            ? 'ring-2 ring-slate-900 ring-offset-2'
                                            : 'ring-1 ring-slate-200 hover:ring-slate-400'
                                    )}
                                >
                                    {item.url && <img src={item.url} alt={item.nombre} className="w-full h-full object-cover" />}
                                </button>
                            )

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onChange(grupo.id, item)}
                                    className={cn(
                                        'px-2.5 py-1 text-xs font-medium rounded-md border transition-colors duration-200 ease-in-out',
                                        activo
                                            ? 'border-slate-900 bg-slate-900 text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-800'
                                    )}
                                >
                                    {item.nombre}
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}
        </>
    )
}
