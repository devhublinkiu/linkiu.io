import { type ReactNode } from 'react'
import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { BarChart2, Users, Clock, Flag, TrendingUp } from 'lucide-react'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/Select'
import { EstadisticaCard } from '@/Pages/admin/vista-en-vivo/parts/EstadisticaCard'
import { FunnelBarras, type SeccionFunnel } from './parts/FunnelBarras'
import { TablaComparativa, type FilaComparativa } from './parts/TablaComparativa'

interface Producto {
    id:     number
    nombre: string
}

interface Resumen {
    sesiones:            number
    duracion_promedio:   number
    llego_al_final_pct:  number
    conversion_pct:      number
}

interface FiltrosActivos {
    producto_id: number | null
    periodo:     string
    origen:      string | null
}

interface Props {
    resumen:         Resumen
    funnel:          SeccionFunnel[]
    por_origen:      FilaComparativa[]
    por_dispositivo: FilaComparativa[]
    productos:       Producto[]
    filtros_activos: FiltrosActivos
}

function formatDuracion(seg: number): string {
    if (seg < 60) return `${seg}s`
    const m = Math.floor(seg / 60)
    const s = seg % 60
    return `${m}:${String(s).padStart(2, '0')}`
}

const PERIODO_LABEL: Record<string, string> = {
    hoy: 'Hoy',
    '7d': 'Últimos 7 días',
    '30d': 'Últimos 30 días',
}

function Funelinks({
    resumen         = { sesiones: 0, duracion_promedio: 0, llego_al_final_pct: 0, conversion_pct: 0 },
    funnel          = [],
    por_origen      = [],
    por_dispositivo = [],
    productos       = [],
    filtros_activos = { producto_id: null, periodo: '7d', origen: null },
}: Props) {

    function aplicarFiltros(cambios: Partial<FiltrosActivos>) {
        const nuevo = { ...filtros_activos, ...cambios }
        router.get(route('admin.analytics.funelinks'), {
            producto_id: nuevo.producto_id ?? undefined,
            periodo:     nuevo.periodo,
            origen:      nuevo.origen ?? undefined,
        }, { preserveScroll: true, preserveState: true })
    }

    return (
        <>
            <Head title="Funelinks" />

            <div className="space-y-4">
                {/* Header canonical */}
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <BarChart2 className="w-4 h-4 text-slate-600" />
                    </span>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Funelinks</h1>
                        <p className="text-xs text-slate-500">
                            Análisis del recorrido del visitante por producto · {PERIODO_LABEL[filtros_activos.periodo] ?? 'Últimos 7 días'}
                        </p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Producto</label>
                        <Select
                            value={String(filtros_activos.producto_id ?? '')}
                            onValueChange={v => aplicarFiltros({ producto_id: v ? Number(v) : null })}
                        >
                            <SelectTrigger><SelectValue placeholder="Todos los productos" /></SelectTrigger>
                            <SelectContent>
                                {productos.map(p => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Período</label>
                        <Select
                            value={filtros_activos.periodo}
                            onValueChange={v => aplicarFiltros({ periodo: v })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hoy">Hoy</SelectItem>
                                <SelectItem value="7d">Últimos 7 días</SelectItem>
                                <SelectItem value="30d">Últimos 30 días</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Origen</label>
                        <Select
                            value={filtros_activos.origen ?? '__todos__'}
                            onValueChange={v => aplicarFiltros({ origen: v === '__todos__' ? null : v })}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__todos__">Todos los orígenes</SelectItem>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="google">Google</SelectItem>
                                <SelectItem value="direct">Directo</SelectItem>
                                <SelectItem value="otros">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 4 EstadisticaCard de resumen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <EstadisticaCard
                        icono={<Users className="size-5" />}
                        label="Sesiones"
                        valor={String(resumen.sesiones)}
                        sublabel={PERIODO_LABEL[filtros_activos.periodo] ?? '7 días'}
                        color="blue"
                    />
                    <EstadisticaCard
                        icono={<Clock className="size-5" />}
                        label="Duración"
                        valor={formatDuracion(resumen.duracion_promedio)}
                        sublabel="promedio"
                        color="slate"
                    />
                    <EstadisticaCard
                        icono={<Flag className="size-5" />}
                        label="Llegó al final"
                        valor={`${resumen.llego_al_final_pct}%`}
                        sublabel="vio sellos de confianza"
                        color="emerald"
                    />
                    <EstadisticaCard
                        icono={<TrendingUp className="size-5" />}
                        label="Conversión"
                        valor={`${resumen.conversion_pct}%`}
                        sublabel="sesión a venta"
                        color="amber"
                    />
                </div>

                {/* Funnel */}
                <FunnelBarras secciones={funnel} />

                {/* Comparativas */}
                <TablaComparativa
                    titulo="Por origen — qué fuente trae mejor calidad"
                    tipo="origen"
                    filas={por_origen}
                />

                <TablaComparativa
                    titulo="Por dispositivo"
                    tipo="dispositivo"
                    filas={por_dispositivo}
                />
            </div>
        </>
    )
}

Funelinks.layout = (page: ReactNode) => <AdminLayout titulo="Funelinks">{page}</AdminLayout>

export default Funelinks
