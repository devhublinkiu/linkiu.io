import { useEffect, useState, type ReactNode } from 'react'
import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { getAblyClient } from '@/ably'
import { Users, ShoppingBag, DollarSign, TrendingUp, Activity } from 'lucide-react'
import { EstadisticaCard } from './parts/EstadisticaCard'
import { CiudadesActivas } from './parts/CiudadesActivas'
import { StreamVentas, type VentaItem } from './parts/StreamVentas'
import { TopProductos } from './parts/TopProductos'

interface Props {
    online:         number
    ventas_hoy:     number
    revenue_hoy:    number
    conversion:     number
    top_productos:  {
        producto_id:    number
        nombre:         string
        imagen:         string | null
        total_vendidas: number
        revenue:        number
    }[]
    ciudades:       { ciudad: string; count: number }[]
    ultimas_ventas: VentaItem[]
}

function formatRevenue(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
    if (n >= 1_000)     return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
    return `$${n}`
}

function VistaEnVivo({ online = 0, ventas_hoy = 0, revenue_hoy = 0, conversion = 0, top_productos = [], ciudades = [], ultimas_ventas = [] }: Props) {

    // online y ciudades llegan por push de Ably (server-side debounce 5s).
    // Mantenemos copia local para actualizarla sin tocar Inertia props.
    const [onlineLive, setOnlineLive]     = useState(online)
    const [ciudadesLive, setCiudadesLive] = useState(ciudades)

    // IDs de ventas marcadas como "nuevas" — se destacan visualmente con fondo
    // verde por 5s y despues vuelven al estado normal.
    const [idsNuevas, setIdsNuevas] = useState<Set<number>>(new Set())

    // Sync cuando Inertia recarga (ej. al volver de otra ruta).
    useEffect(() => { setOnlineLive(online) },     [online])
    useEffect(() => { setCiudadesLive(ciudades) }, [ciudades])

    // Push real-time via Ably — reutiliza el canal `admin-orders` ya activo
    // para notificaciones del navbar:
    //   - 'orden.nueva' → recarga widgets de BD (ventas, revenue, top, stream)
    //                    y marca el ID como "nuevo" durante 5s.
    //   - 'presencia.actualizada' → actualiza state local sin request al server.
    useEffect(() => {
        const client = getAblyClient()
        const canal  = client.channels.get('admin-orders')

        const onOrden = (msg: { data: { id: number } }) => {
            const id = msg.data.id
            setIdsNuevas(prev => {
                const next = new Set(prev)
                next.add(id)
                return next
            })
            setTimeout(() => {
                setIdsNuevas(prev => {
                    const next = new Set(prev)
                    next.delete(id)
                    return next
                })
            }, 5_000)

            router.reload({
                only: ['ventas_hoy', 'revenue_hoy', 'conversion', 'top_productos', 'ultimas_ventas'],
                preserveScroll: true,
            })
        }

        const onPresencia = (msg: { data: { online: number; ciudades: { ciudad: string; count: number }[] } }) => {
            setOnlineLive(msg.data.online)
            setCiudadesLive(msg.data.ciudades ?? [])
        }

        canal.subscribe('orden.nueva',          onOrden)
        canal.subscribe('presencia.actualizada', onPresencia)

        return () => {
            canal.unsubscribe('orden.nueva',          onOrden)
            canal.unsubscribe('presencia.actualizada', onPresencia)
        }
    }, [])

    return (
        <>
            <Head title="Vista en tiempo real" />

            <div className="space-y-4">
                {/* Header canonical del modulo (AGENTS.md) */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Activity className="w-4 h-4 text-slate-600" />
                        </span>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">Vista en tiempo real</h1>
                            <p className="text-xs text-slate-500">
                                {onlineLive} {onlineLive === 1 ? 'persona' : 'personas'} viendo · {ventas_hoy} {ventas_hoy === 1 ? 'venta' : 'ventas'} hoy
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        Datos en tiempo real
                    </div>
                </div>

                {/* 4 cards principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <EstadisticaCard
                        icono={<Users className="size-5" />}
                        label="Personas conectadas"
                        valor={String(onlineLive)}
                        sublabel="viendo la tienda ahora"
                        color="blue"
                    />
                    <EstadisticaCard
                        icono={<ShoppingBag className="size-5" />}
                        label="Ventas hoy"
                        valor={String(ventas_hoy)}
                        sublabel={ventas_hoy === 1 ? 'pedido confirmado' : 'pedidos confirmados'}
                        color="emerald"
                    />
                    <EstadisticaCard
                        icono={<DollarSign className="size-5" />}
                        label="Ingresos hoy"
                        valor={formatRevenue(revenue_hoy)}
                        color="emerald"
                    />
                    <EstadisticaCard
                        icono={<TrendingUp className="size-5" />}
                        label="Conversión"
                        valor={`${conversion}%`}
                        sublabel="del total de visitas"
                        color="amber"
                    />
                </div>

                {/* 3 columnas: Ciudades · Ventas en vivo · Top 5 productos */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <CiudadesActivas ciudades={ciudadesLive} />
                    <StreamVentas ventas={ultimas_ventas} idsNuevas={idsNuevas} />
                    <TopProductos productos={top_productos} />
                </div>
            </div>
        </>
    )
}

VistaEnVivo.layout = (page: ReactNode) => <AdminLayout titulo="Vista en tiempo real">{page}</AdminLayout>

export default VistaEnVivo
