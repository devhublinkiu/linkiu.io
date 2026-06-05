import { type ReactNode } from 'react'
import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { BarChart2, Users, Clock, Flag, TrendingUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/Tabs'
import { EstadisticaCard } from '@/Pages/admin/vista-en-vivo/parts/EstadisticaCard'
import { FunnelBarras, type SeccionFunnel } from './parts/FunnelBarras'
import { TablaComparativa, type FilaComparativa } from './parts/TablaComparativa'
import { TablaCampanas, type FilaCampana } from './parts/TablaCampanas'
import { HeaderInsights, type Insight } from './parts/HeaderInsights'
import { FiltrosChips, type FiltrosState, type ProductoOpt, type CampanaOpt } from './parts/FiltrosChips'

interface Resumen {
    sesiones:            number
    duracion_promedio:   number
    llego_al_final_pct:  number
    conversion_pct:      number
}

interface Props {
    resumen:              Resumen
    funnel:               SeccionFunnel[]
    por_origen:           FilaComparativa[]
    por_dispositivo:      FilaComparativa[]
    por_campana:          FilaCampana[]
    campanas_disponibles: CampanaOpt[]
    insights:             Insight[]
    productos:            ProductoOpt[]
    filtros_activos:      FiltrosState
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
    resumen              = { sesiones: 0, duracion_promedio: 0, llego_al_final_pct: 0, conversion_pct: 0 },
    funnel               = [],
    por_origen           = [],
    por_dispositivo      = [],
    por_campana          = [],
    campanas_disponibles = [],
    insights             = [],
    productos            = [],
    filtros_activos      = { producto_id: null, periodo: '7d', origen: null, utm_campaign: null },
}: Props) {

    function aplicarFiltros(cambios: Partial<FiltrosState>) {
        const nuevo = { ...filtros_activos, ...cambios }
        router.get(route('admin.analytics.funelinks'), {
            producto_id:  nuevo.producto_id ?? undefined,
            periodo:      nuevo.periodo,
            origen:       nuevo.origen ?? undefined,
            utm_campaign: nuevo.utm_campaign ?? undefined,
        }, { preserveScroll: true, preserveState: true })
    }

    return (
        <>
            <Head title="Funelinks" />

            <div className="space-y-5">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <BarChart2 className="w-4 h-4 text-slate-600" />
                    </span>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Funelinks</h1>
                        <p className="text-xs text-slate-500">
                            Análisis del recorrido y la atribución por campaña · {PERIODO_LABEL[filtros_activos.periodo] ?? 'Últimos 7 días'}
                        </p>
                    </div>
                </div>

                {/* Insights destacados — el "qué mirar primero" */}
                <HeaderInsights insights={insights} />

                {/* Filtros como chips */}
                <FiltrosChips
                    filtros={filtros_activos}
                    productos={productos}
                    campanasDisponibles={campanas_disponibles}
                    onCambiar={aplicarFiltros}
                />

                {/* 4 cards de resumen */}
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

                {/* Tabs: Funnel | Campañas | Origen | Dispositivo */}
                <Tabs defaultValue="funnel" className="w-full">
                    <TabsList className="w-fit">
                        <TabsTrigger value="funnel">Funnel</TabsTrigger>
                        <TabsTrigger value="campanas">
                            Por campaña
                            {por_campana.length > 0 && (
                                <span className="ml-1.5 text-[10px] font-medium text-slate-400">
                                    ({por_campana.length})
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="origen">Por origen</TabsTrigger>
                        <TabsTrigger value="dispositivo">Por dispositivo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="funnel" className="mt-4">
                        <FunnelBarras secciones={funnel} />
                    </TabsContent>

                    <TabsContent value="campanas" className="mt-4">
                        <TablaCampanas
                            filas={por_campana}
                            utmCampaignFiltro={filtros_activos.utm_campaign}
                            onFiltrarCampana={c => aplicarFiltros({ utm_campaign: c })}
                        />
                    </TabsContent>

                    <TabsContent value="origen" className="mt-4">
                        <TablaComparativa
                            titulo="Por origen — qué fuente trae mejor calidad"
                            tipo="origen"
                            filas={por_origen}
                        />
                    </TabsContent>

                    <TabsContent value="dispositivo" className="mt-4">
                        <TablaComparativa
                            titulo="Por dispositivo"
                            tipo="dispositivo"
                            filas={por_dispositivo}
                        />
                    </TabsContent>
                </Tabs>

            </div>
        </>
    )
}

Funelinks.layout = (page: ReactNode) => <AdminLayout titulo="Funelinks">{page}</AdminLayout>

export default Funelinks
