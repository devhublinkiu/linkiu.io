import { useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon, Loader2Icon } from 'lucide-react'
import { Input } from '@/Components/ui/Input'
import type { Ciudad, DepartamentoSeleccionado, DptoApi } from './types'

interface Props {
    dpto:           DptoApi
    ciudades:       Ciudad[]                                // filtradas y ordenadas para este dpto
    cargando:       boolean                                 // carga global pendiente
    seleccionado:   DepartamentoSeleccionado | undefined
    onToggleDpto:   (dpto: DptoApi) => void
    onToggleCiudad: (dptoId: number, ciudad: Ciudad) => void
}

// Fila colapsable de departamento. Si está seleccionada muestra el contador de
// ciudades y permite gestionar la selección por ciudad individualmente.
export default function DptoRow({ dpto, ciudades, cargando, seleccionado, onToggleDpto, onToggleCiudad }: Props) {
    const [expandido, setExpandido] = useState(false)
    const [busqueda,  setBusqueda]  = useState('')

    const filtradas = busqueda
        ? ciudades.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
        : ciudades

    const todasSeleccionadas = seleccionado && ciudades.length > 0 &&
        ciudades.every(c => seleccionado.ciudades.some(sc => sc.id === c.id))

    function toggleTodas() {
        if (!seleccionado) {
            onToggleDpto(dpto)
        } else if (todasSeleccionadas) {
            onToggleDpto(dpto)
        } else {
            ciudades.forEach(c => {
                if (!seleccionado.ciudades.some(sc => sc.id === c.id)) {
                    onToggleCiudad(dpto.id, c)
                }
            })
        }
    }

    return (
        <div className="border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors duration-200 ease-in-out">
                <input
                    type="checkbox"
                    checked={!!seleccionado}
                    onChange={() => onToggleDpto(dpto)}
                    className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900 shrink-0"
                />
                <button
                    onClick={() => setExpandido(v => !v)}
                    className="flex flex-1 items-center gap-1.5 text-left min-w-0"
                >
                    {expandido
                        ? <ChevronDownIcon className="size-3.5 text-slate-400 shrink-0" />
                        : <ChevronRightIcon className="size-3.5 text-slate-400 shrink-0" />
                    }
                    <span className="text-sm text-slate-700 truncate">{dpto.name}</span>
                    {seleccionado && (
                        <span className="ml-auto shrink-0 text-xs text-slate-500">
                            {seleccionado.ciudades.length} ciudades
                        </span>
                    )}
                </button>
            </div>

            {expandido && (
                <div className="ml-8 border-l border-slate-100 pb-2">
                    {cargando ? (
                        <div className="flex items-center gap-2 px-3 py-3">
                            <Loader2Icon className="size-3.5 animate-spin text-slate-400" />
                            <span className="text-xs text-slate-500">Cargando ciudades…</span>
                        </div>
                    ) : (
                        <>
                            <div className="px-3 pt-2 pb-1">
                                <Input
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                    placeholder="Buscar ciudad..."
                                    className="text-xs h-7"
                                />
                            </div>
                            {ciudades.length > 0 && !busqueda && (
                                <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-slate-50 transition-colors duration-200 ease-in-out">
                                    <input
                                        type="checkbox"
                                        checked={!!todasSeleccionadas}
                                        onChange={toggleTodas}
                                        className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900"
                                    />
                                    <span className="text-xs font-semibold text-slate-600">Todas las ciudades</span>
                                </label>
                            )}
                            <div className="max-h-36 overflow-y-auto">
                                {filtradas.map(ciudad => {
                                    const marcada = !!seleccionado?.ciudades.some(sc => sc.id === ciudad.id)
                                    return (
                                        <label
                                            key={ciudad.id}
                                            className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-slate-50 transition-colors duration-200 ease-in-out"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={marcada}
                                                onChange={() => {
                                                    if (!seleccionado) onToggleDpto(dpto)
                                                    onToggleCiudad(dpto.id, ciudad)
                                                }}
                                                className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900"
                                            />
                                            <span className="text-xs text-slate-600">{ciudad.nombre}</span>
                                        </label>
                                    )
                                })}
                                {filtradas.length === 0 && (
                                    <p className="px-3 py-3 text-xs text-slate-500">Sin resultados</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
