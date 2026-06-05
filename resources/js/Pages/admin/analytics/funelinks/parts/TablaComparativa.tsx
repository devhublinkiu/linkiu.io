import { Smartphone, Monitor, Tablet, type LucideIcon } from 'lucide-react'
import { Badge } from '@/Components/ui/Badge'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/Table'
import { BadgeEstado } from './BadgeEstado'

export interface FilaComparativa {
    valor:             string  // 'facebook' | 'movil' | etc.
    sesiones:          number
    duracion_promedio: number
    llego_al_final:    number
    conversion:        number
    estado:            'bueno' | 'medio' | 'bajo'
}

interface Props {
    titulo:    string
    tipo:      'origen' | 'dispositivo'
    filas:     FilaComparativa[]
}

const ORIGEN_LABEL: Record<string, string> = {
    facebook:  'Facebook',
    instagram: 'Instagram',
    google:    'Google',
    direct:    'Directo',
    otros:     'Otros',
}

const ORIGEN_BADGE: Record<string, string> = {
    facebook:  'bg-blue-50 text-blue-700',
    instagram: 'bg-amber-50 text-amber-700',
    google:    'bg-emerald-50 text-emerald-700',
    direct:    'bg-slate-100 text-slate-700',
    otros:     'bg-slate-50 text-slate-500',
}

const DISPOSITIVO_ICON: Record<string, LucideIcon> = {
    movil:    Smartphone,
    desktop:  Monitor,
    tablet:   Tablet,
}

const DISPOSITIVO_LABEL: Record<string, string> = {
    movil:    'Móvil',
    desktop:  'Desktop',
    tablet:   'Tablet',
}

function formatDuracion(seg: number): string {
    if (seg < 60) return `${seg}s`
    const m = Math.floor(seg / 60)
    const s = seg % 60
    return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Tabla genérica comparativa para Funelinks. Muestra una fila por valor
 * de origen o dispositivo. Sesiones llevan barra proporcional al máximo del
 * set para visualización rápida de quién manda. Conversión también con barra.
 */
export function TablaComparativa({ titulo, tipo, filas }: Props) {
    const maxSesiones   = Math.max(...filas.map(f => f.sesiones), 1)
    const maxConversion = Math.max(...filas.map(f => f.conversion), 1)

    if (filas.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                No hay datos para mostrar.
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900">{titulo}</h3>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{tipo === 'origen' ? 'Origen' : 'Dispositivo'}</TableHead>
                        <TableHead>Sesiones</TableHead>
                        <TableHead className="text-right">Duración prom.</TableHead>
                        <TableHead className="text-right">Llegó al final</TableHead>
                        <TableHead>Conversión</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filas.map(f => {
                        const pctSesiones   = (f.sesiones   / maxSesiones)   * 100
                        const pctConversion = (f.conversion / maxConversion) * 100

                        return (
                            <TableRow key={f.valor}>
                                <TableCell>
                                    {tipo === 'origen' ? (
                                        <Badge variant="secondary" className={ORIGEN_BADGE[f.valor] ?? 'bg-slate-100 text-slate-700'}>
                                            {ORIGEN_LABEL[f.valor] ?? f.valor}
                                        </Badge>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                                            {(() => {
                                                const Icon = DISPOSITIVO_ICON[f.valor]
                                                return Icon ? <Icon className="w-4 h-4 text-slate-500" /> : null
                                            })()}
                                            <span className="text-sm">{DISPOSITIVO_LABEL[f.valor] ?? f.valor}</span>
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-400 rounded-full" style={{ width: `${pctSesiones}%` }} />
                                        </div>
                                        <span className="tabular-nums text-xs text-slate-700 w-12 text-right">{f.sesiones}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-slate-700">{formatDuracion(f.duracion_promedio)}</TableCell>
                                <TableCell className="text-right tabular-nums text-slate-700">{f.llego_al_final}%</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 max-w-[120px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pctConversion}%` }} />
                                        </div>
                                        <span className="tabular-nums text-xs font-semibold text-slate-900 w-12 text-right">{f.conversion}%</span>
                                    </div>
                                </TableCell>
                                <TableCell><BadgeEstado estado={f.estado} /></TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
