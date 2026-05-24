import { type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import ClientLayout from '@/Layouts/ClientLayout'
import StatusBadge, { type Estado } from '@/Pages/admin/ordenes/parts/StatusBadge'

interface Orden {
    id:           number
    codigo:       string
    acceso_token: string
    estado:       Estado
    total:        number
    metodo_pago:  string
    created_at:   string
}

interface Paginado<T> {
    data: T[]
    current_page: number
    last_page: number
    total: number
    from: number | null
    to: number | null
}

interface Props {
    ordenes: Paginado<Orden>
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function Pedidos() {
    const { ordenes } = usePage<Props>().props

    function irAPagina(page: number) {
        router.get(route('cuenta.pedidos'), { page }, { preserveState: true, preserveScroll: true })
    }

    return (
        <>
            <Head title="Mis pedidos" />

            {ordenes.total === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg py-16 text-center">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-700 mb-1">Aún no tienes pedidos</p>
                    <p className="text-xs text-slate-500">Cuando realices un pedido aparecerá aquí.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Pedido</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Estado</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {ordenes.data.map(orden => (
                                <tr
                                    key={orden.id}
                                    className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                                    onClick={() => router.visit(route('orden.seguimiento', { order: orden.acceso_token }))}
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-mono text-xs font-bold text-slate-900">{orden.codigo}</p>
                                        <p className="text-xs text-slate-500 capitalize">{orden.metodo_pago.replace('_', ' ')}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge estado={orden.estado} />
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                                        {formatPrecio(orden.total)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">
                                        {orden.created_at}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {ordenes.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500">
                                {ordenes.from}–{ordenes.to} de {ordenes.total}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => irAPagina(ordenes.current_page - 1)}
                                    disabled={ordenes.current_page === 1}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors duration-200"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => irAPagina(ordenes.current_page + 1)}
                                    disabled={ordenes.current_page === ordenes.last_page}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors duration-200"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

Pedidos.layout = (page: ReactNode) => (
    <ClientLayout tab="pedidos">{page}</ClientLayout>
)

export default Pedidos
