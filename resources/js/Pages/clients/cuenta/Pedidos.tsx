import { type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { ShoppingBag } from 'lucide-react'
import ClientLayout from '@/Layouts/ClientLayout'
import StatusBadge from '@/Pages/admin/ordenes/parts/StatusBadge'

interface Orden {
    id: number
    codigo: string
    estado: string
    total: number
    metodo_pago: string
    created_at: string
}

interface Props {
    ordenes: Orden[]
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function Pedidos() {
    const { ordenes } = usePage<Props>().props

    return (
        <>
            <Head title="Mis pedidos" />

            {ordenes.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-700 mb-1">Aún no tienes pedidos</p>
                    <p className="text-xs text-slate-400">Cuando realices un pedido aparecerá aquí.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
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
                            {ordenes.map(orden => (
                                <tr
                                    key={orden.id}
                                    className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                                    onClick={() => router.visit(route('orden.seguimiento', orden.codigo))}
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-mono text-xs font-bold text-slate-900">{orden.codigo}</p>
                                        <p className="text-xs text-slate-400 capitalize">{orden.metodo_pago.replace('_', ' ')}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge estado={orden.estado as any} />
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                                        {formatPrecio(orden.total)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">
                                        {orden.created_at}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}

Pedidos.layout = (page: ReactNode) => (
    <ClientLayout tab="pedidos">{page}</ClientLayout>
)

export default Pedidos
