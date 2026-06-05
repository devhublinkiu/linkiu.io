import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Megaphone, Filter } from 'lucide-react'
import { Badge } from '@/Components/ui/Badge'
import { Button } from '@/Components/ui/Button'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/Table'
import { BadgeEstado } from './BadgeEstado'
import { cn } from '@/lib/utils'

export interface FilaCampana {
    utm_campaign:      string
    utm_source:        string | null
    utm_medium:        string | null
    sesiones:          number
    duracion_promedio: number
    llego_al_final:    number
    conversion:        number
    estado:            'bueno' | 'medio' | 'bajo'
}

interface Props {
    filas:            FilaCampana[]
    utmCampaignFiltro: string | null
    onFiltrarCampana: (campana: string | null) => void
}

type ColumnaSort = 'sesiones' | 'duracion_promedio' | 'llego_al_final' | 'conversion'

function formatDuracion(seg: number): string {
    if (seg < 60) return `${seg}s`
    const m = Math.floor(seg / 60)
    const s = seg % 60
    return `${m}:${String(s).padStart(2, '0')}`
}

const ORIGEN_BADGE: Record<string, string> = {
    facebook:  'bg-blue-50 text-blue-700 border-blue-200',
    instagram: 'bg-amber-50 text-amber-700 border-amber-200',
    google:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    direct:    'bg-slate-100 text-slate-700 border-slate-200',
}

/**
 * Tabla de campañas UTM con sort por columna. Click en una fila aplica el
 * filtro `utm_campaign` al resto del dashboard. Vacío hasta que haya tráfico
 * con UTMs (las sesiones pre-deploy no las tienen).
 */
export function TablaCampanas({ filas, utmCampaignFiltro, onFiltrarCampana }: Props) {
    const [columnaActiva, setColumnaActiva] = useState<ColumnaSort>('sesiones')
    const [direccion,     setDireccion]     = useState<'asc' | 'desc'>('desc')

    function toggleSort(col: ColumnaSort) {
        if (col === columnaActiva) {
            setDireccion(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setColumnaActiva(col)
            setDireccion('desc')
        }
    }

    const filasOrdenadas = [...filas].sort((a, b) => {
        const v = a[columnaActiva] - b[columnaActiva]
        return direccion === 'asc' ? v : -v
    })

    function IconoSort({ col }: { col: ColumnaSort }) {
        if (col !== columnaActiva) return <ArrowUpDown className="w-3 h-3 opacity-40 inline-block ml-1" />
        return direccion === 'asc'
            ? <ArrowUp   className="w-3 h-3 inline-block ml-1" />
            : <ArrowDown className="w-3 h-3 inline-block ml-1" />
    }

    if (filas.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <Megaphone className="size-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700 mb-1">Aún no hay campañas registradas</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Las campañas se empiezan a registrar cuando los visitantes llegan con UTMs en el URL
                    (ej. <code className="bg-slate-100 px-1 rounded">?utm_campaign=marzo-mujeres</code>).
                    Genera tus enlaces con el Generador de Enlaces UTM.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Por campaña UTM</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Click en una fila para filtrar el resto del dashboard.</p>
                </div>
                {utmCampaignFiltro && (
                    <Button variant="outline" size="sm" onClick={() => onFiltrarCampana(null)}>
                        <Filter className="size-3" />
                        Quitar filtro
                    </Button>
                )}
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Campaña</TableHead>
                        <TableHead>Fuente</TableHead>
                        <TableHead>Medio</TableHead>
                        <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort('sesiones')}>
                            Sesiones<IconoSort col="sesiones" />
                        </TableHead>
                        <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort('duracion_promedio')}>
                            Duración<IconoSort col="duracion_promedio" />
                        </TableHead>
                        <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort('llego_al_final')}>
                            Llegó al final<IconoSort col="llego_al_final" />
                        </TableHead>
                        <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort('conversion')}>
                            Conversión<IconoSort col="conversion" />
                        </TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filasOrdenadas.map(f => {
                        const seleccionada = utmCampaignFiltro === f.utm_campaign
                        return (
                            <TableRow
                                key={f.utm_campaign}
                                onClick={() => onFiltrarCampana(seleccionada ? null : f.utm_campaign)}
                                className={cn(
                                    'cursor-pointer hover:bg-slate-50 transition-colors duration-150',
                                    seleccionada && 'bg-slate-100 hover:bg-slate-100',
                                )}
                            >
                                <TableCell className="font-mono text-xs text-slate-900 max-w-[200px] truncate" title={f.utm_campaign}>
                                    {f.utm_campaign}
                                </TableCell>
                                <TableCell>
                                    {f.utm_source ? (
                                        <Badge variant="secondary" className={cn('border', ORIGEN_BADGE[f.utm_source.toLowerCase()] ?? 'bg-slate-50 text-slate-600 border-slate-200')}>
                                            {f.utm_source}
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-slate-400">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-xs text-slate-600">{f.utm_medium ?? '—'}</TableCell>
                                <TableCell className="text-right tabular-nums text-slate-700">{f.sesiones}</TableCell>
                                <TableCell className="text-right tabular-nums text-slate-700">{formatDuracion(f.duracion_promedio)}</TableCell>
                                <TableCell className="text-right tabular-nums text-slate-700">{f.llego_al_final}%</TableCell>
                                <TableCell className="text-right tabular-nums font-semibold text-slate-900">{f.conversion}%</TableCell>
                                <TableCell><BadgeEstado estado={f.estado} /></TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
