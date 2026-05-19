import { type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { ShoppingCart, Search } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Input } from '@/Components/ui/Input'
import StatusBadge from './parts/StatusBadge'

interface OrdenResumen {
    id: number
    codigo: string
    estado: string
    nombre: string
    apellido: string
    email: string
    ciudad: string
    total: number
    metodo_pago: string
    created_at: string
}

interface Paginado {
    data: OrdenResumen[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    links: { url: string | null; label: string; active: boolean }[]
}

interface Props {
    ordenes: Paginado
    filtroEstado: string
    filtroQ: string
    totalPendientes: number
}

const ESTADOS = [
    { value: '',           label: 'Todas' },
    { value: 'pendiente',  label: 'Pendientes' },
    { value: 'confirmado', label: 'Confirmadas' },
    { value: 'preparando', label: 'Preparando' },
    { value: 'enviado',    label: 'Enviadas' },
    { value: 'entregado',  label: 'Entregadas' },
    { value: 'cancelado',  label: 'Canceladas' },
]

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function formatFecha(iso: string) {
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function OrdenesList() {
    const { ordenes, filtroEstado, filtroQ, totalPendientes } = usePage<Props>().props

    function filtrar(estado: string) {
        router.get(route('admin.ordenes.index'), { estado, q: filtroQ }, { preserveState: true, replace: true })
    }

    function buscar(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value
        router.get(route('admin.ordenes.index'), { estado: filtroEstado, q }, { preserveState: true, replace: true })
    }

    return (
        <>
            <Head title="Órdenes" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Órdenes</h1>
                        <p className="text-xs text-slate-400">{ordenes.total} en total · {totalPendientes} pendientes</p>
                    </div>
                </div>

                {/* Búsqueda */}
                <form onSubmit={buscar} className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            name="q"
                            defaultValue={filtroQ}
                            placeholder="Código, nombre, email…"
                            className="pl-9 w-64"
                        />
                    </div>
                </form>
            </div>

            {/* Tabs de estado */}
            <div className="flex items-center gap-1 mb-4 border-b border-slate-200">
                {ESTADOS.map(e => (
                    <button
                        key={e.value}
                        onClick={() => filtrar(e.value)}
                        className={`px-3 py-2 text-xs font-medium transition-colors duration-200 border-b-2 -mb-px ${
                            filtroEstado === e.value
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {e.label}
                    </button>
                ))}
            </div>

            {/* Tabla */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {ordenes.data.length === 0 ? (
                    <div className="py-16 text-center">
                        <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">No hay órdenes{filtroEstado ? ` con estado "${filtroEstado}"` : ''}.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Código</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Cliente</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Ciudad</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Pago</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Estado</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {ordenes.data.map(orden => (
                                <tr
                                    key={orden.id}
                                    className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                                    onClick={() => router.visit(route('admin.ordenes.show', orden.id))}
                                >
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">{orden.codigo}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900">{orden.nombre} {orden.apellido}</p>
                                        <p className="text-xs text-slate-400">{orden.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{orden.ciudad}</td>
                                    <td className="px-4 py-3 text-slate-600 capitalize hidden lg:table-cell">{orden.metodo_pago.replace('_', ' ')}</td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900">{formatPrecio(orden.total)}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge estado={orden.estado as any} />
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">{formatFecha(orden.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Paginación */}
            {ordenes.last_page > 1 && (
                <div className="flex items-center justify-center gap-1 mt-4">
                    {ordenes.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url)}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors duration-200 ${
                                link.active
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'
                            }`}
                        />
                    ))}
                </div>
            )}
        </>
    )
}

OrdenesList.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Órdenes' },
    ]}>{page}</AdminLayout>
)

export default OrdenesList
