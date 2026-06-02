import { useEffect, useState, type ReactNode } from 'react'
import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { getAblyClient } from '@/ably'
import { Users, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react'
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

    // Sync cuando Inertia recarga (ej. al volver de otra ruta).
    useEffect(() => { setOnlineLive(online) },     [online])
    useEffect(() => { setCiudadesLive(ciudades) }, [ciudades])

    // Push real-time via Ably — reutiliza el canal `admin-orders` ya activo
    // para notificaciones del navbar:
    //   - 'orden.nueva' → recarga widgets de BD (ventas, revenue, top, stream).
    //   - 'presencia.actualizada' → actualiza state local sin request al server.
    useEffect(() => {
        const client = getAblyClient()
        const canal  = client.channels.get('admin-orders')

        const onOrden = () => {
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
            <Head title="Vista en vivo" />

            <div className="space-y-4">
                {/* Indicador "en vivo" */}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    En vivo — Ably push (ventas + presencia ≤5s)
                </div>

                {/* 4 cards principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <EstadisticaCard
                        icono={<Users className="size-5" />}
                        label="Online ahora"
                        valor={String(onlineLive)}
                        sublabel="visitantes activos"
                        color="blue"
                    />
                    <EstadisticaCard
                        icono={<ShoppingBag className="size-5" />}
                        label="Ventas hoy"
                        valor={String(ventas_hoy)}
                        sublabel={ventas_hoy === 1 ? 'orden' : 'ordenes'}
                        color="emerald"
                    />
                    <EstadisticaCard
                        icono={<DollarSign className="size-5" />}
                        label="Revenue hoy"
                        valor={formatRevenue(revenue_hoy)}
                        color="violet"
                    />
                    <EstadisticaCard
                        icono={<TrendingUp className="size-5" />}
                        label="Conversión"
                        valor={`${conversion}%`}
                        sublabel="ventas / vistas hoy"
                        color="amber"
                    />
                </div>

                {/* Ciudades + Stream */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                    <div className="lg:col-span-3">
                        <CiudadesActivas ciudades={ciudadesLive} />
                    </div>
                    <div className="lg:col-span-2">
                        <StreamVentas ventas={ultimas_ventas} />
                    </div>
                </div>

                {/* Top productos */}
                <TopProductos productos={top_productos} />
            </div>
        </>
    )
}

VistaEnVivo.layout = (page: ReactNode) => <AdminLayout titulo="Vista en vivo">{page}</AdminLayout>

export default VistaEnVivo
