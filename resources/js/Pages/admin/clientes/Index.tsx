import { type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { Users, Search, Download, MessageCircle, ChevronUpIcon, ChevronDownIcon, ChevronsUpDownIcon } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Input } from '@/Components/ui/Input'
import StatusBadge from '../ordenes/parts/StatusBadge'

interface ClienteResumen {
    id: number
    nombre: string
    apellido: string
    email: string
    telefono: string
    tiene_cuenta: boolean
    orders_count: number
    orders_sum_total: number | null
    orders_max_created_at: string | null
    ultima_ciudad: string | null
    ultimo_estado: string | null
    created_at: string
}

interface Paginado {
    data: ClienteResumen[]
    current_page: number
    last_page: number
    total: number
    links: { url: string | null; label: string; active: boolean }[]
}

interface Props {
    clientes: Paginado
    filtroQ: string
    filtroTipo: string
    sortBy: string
    sortDir: string
    total: number
    totalConCuenta: number
    totalRecaudado: number
}

const TIPOS = [
    { value: '',         label: 'Todos' },
    { value: 'cuenta',   label: 'Con cuenta' },
    { value: 'invitado', label: 'Invitados' },
]

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function formatFecha(iso: string | null) {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

function ClientesIndex() {
    const { clientes, filtroQ, filtroTipo, sortBy, sortDir, total, totalConCuenta, totalRecaudado } = usePage<Props>().props

    function navegar(params: Record<string, string>) {
        router.get(route('admin.clientes.index'), { tipo: filtroTipo, q: filtroQ, sortBy, sortDir, ...params }, { preserveState: true, replace: true })
    }

    function filtrar(tipo: string) {
        navegar({ tipo, q: filtroQ })
    }

    function buscar(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value
        navegar({ q })
    }

    function toggleSort(col: string) {
        if (sortBy === col) {
            navegar({ sortDir: sortDir === 'asc' ? 'desc' : 'asc' })
        } else {
            navegar({ sortBy: col, sortDir: 'desc' })
        }
    }

    function SortIcon({ col }: { col: string }) {
        if (sortBy !== col) return <ChevronsUpDownIcon className="w-3 h-3 text-slate-400 inline ml-1" />
        return sortDir === 'asc'
            ? <ChevronUpIcon className="w-3 h-3 text-slate-700 inline ml-1" />
            : <ChevronDownIcon className="w-3 h-3 text-slate-700 inline ml-1" />
    }

    return (
        <>
            <Head title="Clientes" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Clientes</h1>
                        <p className="text-xs text-slate-400">{total} en total</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <form onSubmit={buscar} className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input
                                name="q"
                                defaultValue={filtroQ}
                                placeholder="Nombre, email, teléfono…"
                                className="pl-9 w-64"
                            />
                        </div>
                    </form>
                    <a
                        href={route('admin.clientes.export')}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors duration-200"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Exportar
                    </a>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                    <p className="text-xs text-slate-400 mb-1">Total clientes</p>
                    <p className="text-2xl font-bold text-slate-900">{total}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                    <p className="text-xs text-slate-400 mb-1">Con cuenta</p>
                    <p className="text-2xl font-bold text-slate-900">{totalConCuenta}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{total > 0 ? Math.round(totalConCuenta / total * 100) : 0}% del total</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                    <p className="text-xs text-slate-400 mb-1">Total recaudado</p>
                    <p className="text-2xl font-bold text-slate-900">{formatPrecio(totalRecaudado)}</p>
                </div>
            </div>

            {/* Tabs tipo */}
            <div className="flex items-center gap-1 mb-4 border-b border-slate-200">
                {TIPOS.map(t => (
                    <button
                        key={t.value}
                        onClick={() => filtrar(t.value)}
                        className={`px-3 py-2 text-xs font-medium transition-colors duration-200 border-b-2 -mb-px ${
                            filtroTipo === t.value
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tabla */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {clientes.data.length === 0 ? (
                    <div className="py-16 text-center">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">No hay clientes{filtroQ ? ` con "${filtroQ}"` : ''}.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Cliente</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Teléfono</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Tipo</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Ciudad</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Último pedido</th>
                                <th
                                    className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell cursor-pointer select-none hover:text-slate-700 transition-colors duration-200"
                                    onClick={() => toggleSort('orders_count')}
                                >
                                    # Pedidos <SortIcon col="orders_count" />
                                </th>
                                <th
                                    className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell cursor-pointer select-none hover:text-slate-700 transition-colors duration-200"
                                    onClick={() => toggleSort('orders_sum_total')}
                                >
                                    Total gastado <SortIcon col="orders_sum_total" />
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden xl:table-cell">Ticket prom.</th>
                                <th className="px-4 py-3 hidden sm:table-cell" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {clientes.data.map(cliente => {
                                const ticketPromedio = cliente.orders_count > 0
                                    ? Math.round((cliente.orders_sum_total ?? 0) / cliente.orders_count)
                                    : 0

                                return (
                                    <tr
                                        key={cliente.id}
                                        className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                                        onClick={() => router.visit(route('admin.clientes.show', cliente.id))}
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900">{cliente.nombre} {cliente.apellido}</p>
                                            <p className="text-xs text-slate-400">{cliente.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell">{cliente.telefono}</td>
                                        <td className="px-4 py-3">
                                            {cliente.tiene_cuenta ? (
                                                <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-700">
                                                    Con cuenta
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-50 text-amber-700">
                                                    Invitado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">
                                            {cliente.ultima_ciudad ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {cliente.ultimo_estado
                                                ? <StatusBadge estado={cliente.ultimo_estado as any} />
                                                : <span className="text-xs text-slate-400">—</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-700 hidden md:table-cell">{cliente.orders_count}</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-900 hidden lg:table-cell">
                                            {formatPrecio(cliente.orders_sum_total ?? 0)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs text-slate-500 hidden xl:table-cell">
                                            {cliente.orders_count > 0 ? formatPrecio(ticketPromedio) : '—'}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <a
                                                href={`https://wa.me/57${cliente.telefono.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-colors duration-200"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                            </a>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Paginación */}
            {clientes.last_page > 1 && (
                <div className="flex items-center justify-center gap-1 mt-4">
                    {clientes.links.map((link, i) => (
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

ClientesIndex.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Clientes' },
    ]}>{page}</AdminLayout>
)

export default ClientesIndex
