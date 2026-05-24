import { type ReactNode } from 'react'
import { Head, Link } from '@inertiajs/react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { ShoppingCart, Users, Package, TrendingUp, ExternalLink } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import StatusBadge, { type Estado } from '@/Pages/admin/ordenes/parts/StatusBadge'

interface OrdenReciente {
    id:         number
    codigo:     string
    total:      number
    estado:     Estado
    created_at: string
}

interface Props {
    pedidos_hoy:        number
    ingresos_hoy:       number
    clientes_total:     number
    productos_activos:  number
    actividad_reciente: OrdenReciente[]
}

function formatPrecio(n: number): string {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function formatNumero(n: number): string {
    return new Intl.NumberFormat('es-CO').format(n)
}

export default function Dashboard({ pedidos_hoy, ingresos_hoy, clientes_total, productos_activos, actividad_reciente }: Props) {
    const stats = [
        { label: 'Pedidos hoy',       valor: formatNumero(pedidos_hoy),       icono: ShoppingCart, color: 'text-blue-500',    fondo: 'bg-blue-50' },
        { label: 'Ingresos hoy',      valor: formatPrecio(ingresos_hoy),      icono: TrendingUp,   color: 'text-emerald-500', fondo: 'bg-emerald-50' },
        { label: 'Clientes',          valor: formatNumero(clientes_total),    icono: Users,        color: 'text-amber-500',   fondo: 'bg-amber-50' },
        { label: 'Productos activos', valor: formatNumero(productos_activos), icono: Package,      color: 'text-slate-500',   fondo: 'bg-slate-100' },
    ]

    return (
        <>
            <Head title="Panel" />

            <div className="space-y-6">

                {/* Cards de stats */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map(({ label, valor, icono: Icono, color, fondo }) => (
                        <div key={label} className="rounded-lg border border-slate-200 bg-white p-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">{label}</p>
                                <div className={`rounded-lg p-2 ${fondo}`}>
                                    <Icono className={`size-4 ${color}`} />
                                </div>
                            </div>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{valor}</p>
                        </div>
                    ))}
                </div>

                {/* Actividad reciente */}
                <div className="rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">Actividad reciente</p>
                        <Link
                            href={route('admin.ordenes.index')}
                            className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors duration-200 ease-in-out"
                        >
                            Ver todas →
                        </Link>
                    </div>

                    {actividad_reciente.length === 0 ? (
                        <p className="px-6 py-12 text-center text-sm text-slate-500">Aún no hay pedidos para mostrar.</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {actividad_reciente.map(orden => (
                                <Link
                                    key={orden.id}
                                    href={route('admin.ordenes.show', orden.id)}
                                    className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors duration-200 ease-in-out group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-mono font-semibold text-slate-900">{orden.codigo}</p>
                                            <StatusBadge estado={orden.estado} />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {formatDistanceToNow(new Date(orden.created_at), { locale: es, addSuffix: true })}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900 shrink-0">{formatPrecio(orden.total)}</p>
                                    <ExternalLink className="size-3.5 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </>
    )
}

Dashboard.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[{ label: 'Panel' }]}>{page}</AdminLayout>
)
