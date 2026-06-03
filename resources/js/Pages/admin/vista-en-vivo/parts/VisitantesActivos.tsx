import { useEffect, useState } from 'react'
import { Users, Smartphone, Monitor, Tablet } from 'lucide-react'
import { Badge } from '@/Components/ui/Badge'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/Table'
import {
    Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
} from '@/Components/ui/Empty'

export interface VisitanteItem {
    identificador: string
    pagina:        string
    seccion:       string | null
    dispositivo:   'movil' | 'desktop' | 'tablet'
    origen:        'facebook' | 'instagram' | 'google' | 'direct' | 'otros'
    iniciado_en:   number   // unix timestamp
    ciudad:        string | null
}

interface Props {
    visitantes: VisitanteItem[]
}

// Etiqueta legible para cada hook del producto (mantener sincronizado con
// los keys del backend).
const NOMBRE_SECCION: Record<string, string> = {
    gancho_promesa:             'Gancho de promesa',
    slider_imagenes:            'Slider de imágenes',
    que_incluye:                'Qué incluye',
    tabla_comparativa:          'Tabla comparativa',
    comparacion_visual:         'Antes y después',
    ficha_tecnica:              'Ficha técnica',
    caracteristicas_destacadas: 'Características',
    como_funciona:              'Cómo funciona',
    resenas_clientes:           'Reseñas',
    galeria_resultados:         'Galería de resultados',
    garantia:                   'Garantía',
    preguntas_frecuentes:       'Preguntas frecuentes',
    sellos_confianza:           'Sellos de confianza',
}

const ORIGEN_LABEL: Record<VisitanteItem['origen'], string> = {
    facebook:  'Facebook',
    instagram: 'Instagram',
    google:    'Google',
    direct:    'Directo',
    otros:     'Otros',
}

// Color de Badge segun origen (paleta DESIGN.md).
const ORIGEN_BADGE: Record<VisitanteItem['origen'], string> = {
    facebook:  'bg-blue-50 text-blue-700',
    instagram: 'bg-amber-50 text-amber-700',
    google:    'bg-emerald-50 text-emerald-700',
    direct:    'bg-slate-100 text-slate-700',
    otros:     'bg-slate-50 text-slate-500',
}

function IconoDispositivo({ tipo }: { tipo: VisitanteItem['dispositivo'] }) {
    const Icon = tipo === 'movil' ? Smartphone : tipo === 'tablet' ? Tablet : Monitor
    const label = tipo === 'movil' ? 'Móvil' : tipo === 'tablet' ? 'Tablet' : 'Desktop'
    return (
        <span className="inline-flex items-center gap-1.5 text-slate-600">
            <Icon className="w-4 h-4" />
            <span className="text-xs">{label}</span>
        </span>
    )
}

function tiempoRelativo(unix: number): string {
    const ms  = Date.now() - unix * 1000
    const seg = Math.floor(ms / 1000)
    if (seg < 60)    return `${Math.max(seg, 0)}s`
    const min = Math.floor(seg / 60)
    if (min < 60)    return `${min} min`
    const hr  = Math.floor(min / 60)
    return `${hr} h`
}

/**
 * Tabla de visitantes conectados ahora con su recorrido. Refresca cada 5s el
 * tiempo relativo de cada fila para que se vea "vivo".
 */
export function VisitantesActivos({ visitantes }: Props) {
    // Tick interno para refrescar las celdas de "tiempo" sin esperar al push.
    const [, setTick] = useState(0)
    useEffect(() => {
        const t = setInterval(() => setTick(n => n + 1), 5_000)
        return () => clearInterval(t)
    }, [])

    if (visitantes.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                    <Users className="size-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Visitantes activos</h3>
                </div>
                <Empty className="border border-dashed border-slate-200 bg-white">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Users />
                        </EmptyMedia>
                        <EmptyTitle>Sin visitantes ahora</EmptyTitle>
                        <EmptyDescription>
                            Cuando alguien entre a tu tienda lo verás aquí en tiempo real.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent />
                </Empty>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
                <Users className="size-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">Visitantes activos</h3>
                <span className="text-xs text-slate-500 ml-auto">{visitantes.length} conectados</span>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Identificador</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>Dispositivo</TableHead>
                        <TableHead>Página actual</TableHead>
                        <TableHead>Sección</TableHead>
                        <TableHead>Ciudad</TableHead>
                        <TableHead className="text-right">Tiempo</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visitantes.map(v => (
                        <TableRow key={v.identificador}>
                            <TableCell className="font-mono text-xs text-slate-700">{v.identificador}</TableCell>

                            <TableCell>
                                <Badge variant="secondary" className={ORIGEN_BADGE[v.origen]}>
                                    {ORIGEN_LABEL[v.origen]}
                                </Badge>
                            </TableCell>

                            <TableCell><IconoDispositivo tipo={v.dispositivo} /></TableCell>

                            <TableCell className="font-mono text-xs text-slate-600 max-w-[260px] truncate">
                                {v.pagina}
                            </TableCell>

                            <TableCell className="text-xs text-slate-700">
                                {v.seccion ? (NOMBRE_SECCION[v.seccion] ?? v.seccion) : <span className="text-slate-400">—</span>}
                            </TableCell>

                            <TableCell className="text-xs text-slate-600">
                                {v.ciudad ?? <span className="text-slate-400">—</span>}
                            </TableCell>

                            <TableCell className="text-right text-xs text-slate-500">
                                {tiempoRelativo(v.iniciado_en)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
