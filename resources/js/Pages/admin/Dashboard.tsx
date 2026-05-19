import { Head } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ShoppingCart, Users, Package, TrendingUp } from 'lucide-react'

const STATS = [
    { label: 'Pedidos hoy',    valor: '—', icono: ShoppingCart, color: 'text-blue-500',    fondo: 'bg-blue-50' },
    { label: 'Clientes',       valor: '—', icono: Users,        color: 'text-emerald-500', fondo: 'bg-emerald-50' },
    { label: 'Productos',      valor: '—', icono: Package,      color: 'text-amber-500',   fondo: 'bg-amber-50' },
    { label: 'Ingresos hoy',   valor: '—', icono: TrendingUp,   color: 'text-slate-500',   fondo: 'bg-slate-100' },
]

export default function Dashboard() {
    return (
        <AdminLayout titulo="Dashboard">
            <Head title="Dashboard" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {STATS.map(({ label, valor, icono: Icono, color, fondo }) => (
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

            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
                <p className="text-sm font-medium text-slate-700">Actividad reciente</p>
                <p className="mt-4 text-sm text-slate-400">Nada que mostrar por ahora.</p>
            </div>

        </AdminLayout>
    )
}
