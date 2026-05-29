import { useMemo, useState } from 'react'
import { Loader2Icon, XIcon } from 'lucide-react'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import DptoRow from './DptoRow'
import type { Ciudad, CiudadApi, DepartamentoSeleccionado, DptoApi } from './types'
import type { SugerenciaCotizacion } from './BadgeSugerencia'
import { DANES_CAPITALES } from './danesCapitales'

interface Props {
    dptos:          DptoApi[]
    ciudades:       CiudadApi[]
    cargando:       boolean
    seleccionados:  DepartamentoSeleccionado[]
    onChange:       (next: DepartamentoSeleccionado[]) => void
    sugerencias?:   Record<string, SugerenciaCotizacion | null>
}

// Selector de departamentos y ciudades: búsqueda + lista colapsable + chips
// de seleccionados. Recibe el estado y notifica cambios hacia arriba — el
// dialog mantiene la fuente de verdad.
export default function DptoSelector({ dptos, ciudades, cargando, seleccionados, onChange, sugerencias }: Props) {
    const [busquedaDpto, setBusquedaDpto] = useState('')

    // Mapa dptoId → Ciudad[] (ordenadas), una vez por cambio en ciudades
    const ciudadesPorDpto = useMemo(() => {
        const map: Record<number, Ciudad[]> = {}
        ciudades.forEach(c => {
            if (!map[c.departmentId]) map[c.departmentId] = []
            map[c.departmentId].push({ id: c.id, nombre: c.name })
        })
        Object.values(map).forEach(arr => arr.sort((a, b) => a.nombre.localeCompare(b.nombre)))
        return map
    }, [ciudades])

    function toggleDpto(dpto: DptoApi) {
        const existe = seleccionados.some(d => d.id === dpto.id)
        if (existe) {
            onChange(seleccionados.filter(d => d.id !== dpto.id))
        } else {
            const ciudadesDelDpto = ciudadesPorDpto[dpto.id] ?? []
            onChange([...seleccionados, { id: dpto.id, nombre: dpto.name, ciudades: ciudadesDelDpto }])
        }
    }

    function toggleCiudad(dptoId: number, ciudad: Ciudad) {
        const next = seleccionados
            .map(d => {
                if (d.id !== dptoId) return d
                const existe = d.ciudades.some(c => c.id === ciudad.id)
                const nuevas = existe
                    ? d.ciudades.filter(c => c.id !== ciudad.id)
                    : [...d.ciudades, ciudad]
                return nuevas.length === 0 ? null : { ...d, ciudades: nuevas }
            })
            .filter((d): d is DepartamentoSeleccionado => d !== null)
        onChange(next)
    }

    const dptosFiltrados = dptos.filter(d =>
        d.name.toLowerCase().includes(busquedaDpto.toLowerCase())
    )
    const totalCiudades = seleccionados.reduce((acc, d) => acc + d.ciudades.length, 0)

    return (
        <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
                <Label>Departamentos y ciudades</Label>
                {seleccionados.length > 0 && (
                    <span className="text-xs text-slate-500">
                        {seleccionados.length} dptos · {totalCiudades} ciudades
                    </span>
                )}
            </div>

            {/* Chips de seleccionados */}
            {seleccionados.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {seleccionados.map(d => (
                        <span
                            key={d.id}
                            className="flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs text-white"
                        >
                            {d.nombre} ({d.ciudades.length})
                            <button
                                onClick={() => onChange(seleccionados.filter(s => s.id !== d.id))}
                                className="text-slate-400 hover:text-white transition-colors duration-200 ease-in-out"
                            >
                                <XIcon className="size-2.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <Input
                value={busquedaDpto}
                onChange={e => setBusquedaDpto(e.target.value)}
                placeholder="Buscar departamento..."
                className="text-sm"
            />

            <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200">
                {cargando ? (
                    <div className="flex items-center justify-center gap-2 py-8">
                        <Loader2Icon className="size-4 animate-spin text-slate-400" />
                        <span className="text-xs text-slate-500">Cargando…</span>
                    </div>
                ) : dptosFiltrados.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-500">Sin resultados</p>
                ) : (
                    dptosFiltrados.map(d => {
                        const daneCode = DANES_CAPITALES[d.name]
                        const sug = daneCode ? sugerencias?.[daneCode] : undefined
                        return (
                            <DptoRow
                                key={d.id}
                                dpto={d}
                                ciudades={ciudadesPorDpto[d.id] ?? []}
                                cargando={cargando}
                                seleccionado={seleccionados.find(s => s.id === d.id)}
                                onToggleDpto={toggleDpto}
                                onToggleCiudad={toggleCiudad}
                                sugerencia={sug}
                            />
                        )
                    })
                )}
            </div>
        </div>
    )
}
