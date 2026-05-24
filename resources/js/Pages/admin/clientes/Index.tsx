import { type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { ChevronDownIcon, ChevronLeft, ChevronRight, ChevronsUpDownIcon, ChevronUpIcon, Download, MessageCircle, Search, Users } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/Table'
import {
    Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
} from '@/Components/ui/Pagination'
import {
    Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
} from '@/Components/ui/Empty'
import { rangoPaginacion } from '@/lib/utils'
import { whatsappLink } from '@/lib/whatsapp'
import StatusBadge, { type Estado } from '../ordenes/parts/StatusBadge'

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
    ultimo_estado: Estado | null
    created_at: string
}

interface Paginado {
    data:         ClienteResumen[]
    current_page: number
    last_page:    number
    total:        number
    links:        { url: string | null; label: string; active: boolean }[]
}

interface Props {
    clientes:       Paginado
    filtroQ:        string
    filtroTipo:     string
    sortBy:         string
    sortDir:        string
    total:          number
    totalConCuenta: number
    totalRecaudado: number
}

const TIPOS = [
    { value: '',         label: 'Todos'      },
    { value: 'cuenta',   label: 'Con cuenta' },
    { value: 'invitado', label: 'Invitados'  },
]

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
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

    function irAPagina(page: number) {
        navegar({ page: String(page) })
    }

    function SortIcon({ col }: { col: string }) {
        if (sortBy !== col) return <ChevronsUpDownIcon className="w-3 h-3 text-slate-500 inline ml-1" />
        return sortDir === 'asc'
            ? <ChevronUpIcon className="w-3 h-3 text-slate-700 inline ml-1" />
            : <ChevronDownIcon className="w-3 h-3 text-slate-700 inline ml-1" />
    }

    const paginas = rangoPaginacion(clientes.current_page, clientes.last_page)
    const sinClientes   = total === 0 && !filtroQ && !filtroTipo
    const sinResultados = clientes.data.length === 0 && !sinClientes

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
                        <p className="text-xs text-slate-500">{total} en total</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <form onSubmit={buscar}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                            <Input
                                name="q"
                                defaultValue={filtroQ}
                                placeholder="Nombre, email, teléfono…"
                                className="pl-9 w-64"
                            />
                        </div>
                    </form>
                    <Button variant="outline" size="sm" asChild>
                        <a href={route('admin.clientes.export')}>
                            <Download className="w-3.5 h-3.5" />
                            Exportar
                        </a>
                    </Button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                    <p className="text-xs text-slate-500 mb-1">Total clientes</p>
                    <p className="text-2xl font-bold text-slate-900">{total}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                    <p className="text-xs text-slate-500 mb-1">Con cuenta</p>
                    <p className="text-2xl font-bold text-slate-900">{totalConCuenta}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{total > 0 ? Math.round(totalConCuenta / total * 100) : 0}% del total</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                    <p className="text-xs text-slate-500 mb-1">Total recaudado</p>
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

            {/* Tabla o Empty */}
            {sinClientes ? (
                <Empty className="border border-dashed border-slate-200 bg-white">
                    <EmptyHeader>
                        <EmptyMedia variant="icon"><Users /></EmptyMedia>
                        <EmptyTitle>Aún no hay clientes</EmptyTitle>
                        <EmptyDescription>
                            Cuando alguien complete su primera compra, su ficha aparecerá aquí.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : sinResultados ? (
                <Empty className="border border-dashed border-slate-200 bg-white">
                    <EmptyHeader>
                        <EmptyMedia variant="icon"><Search /></EmptyMedia>
                        <EmptyTitle>Sin resultados</EmptyTitle>
                        <EmptyDescription>
                            No hay clientes{filtroQ ? ` con "${filtroQ}"` : ''}{filtroTipo ? ` del tipo "${filtroTipo}"` : ''}.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="hidden lg:table-cell">Ciudad</TableHead>
                                <TableHead className="hidden lg:table-cell">Último pedido</TableHead>
                                <TableHead
                                    className="text-right hidden md:table-cell cursor-pointer select-none hover:text-slate-700 transition-colors duration-200"
                                    onClick={() => toggleSort('orders_count')}
                                >
                                    # Pedidos <SortIcon col="orders_count" />
                                </TableHead>
                                <TableHead
                                    className="text-right hidden lg:table-cell cursor-pointer select-none hover:text-slate-700 transition-colors duration-200"
                                    onClick={() => toggleSort('orders_sum_total')}
                                >
                                    Total gastado <SortIcon col="orders_sum_total" />
                                </TableHead>
                                <TableHead className="text-right hidden xl:table-cell">Ticket prom.</TableHead>
                                <TableHead className="hidden sm:table-cell" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clientes.data.map(cliente => {
                                const ticketPromedio = cliente.orders_count > 0
                                    ? Math.round((cliente.orders_sum_total ?? 0) / cliente.orders_count)
                                    : 0

                                return (
                                    <TableRow
                                        key={cliente.id}
                                        className="cursor-pointer"
                                        onClick={() => router.visit(route('admin.clientes.show', cliente.id))}
                                    >
                                        <TableCell>
                                            <p className="font-medium text-slate-900">{cliente.nombre} {cliente.apellido}</p>
                                            <p className="text-xs text-slate-500">{cliente.email}</p>
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-xs hidden sm:table-cell">{cliente.telefono}</TableCell>
                                        <TableCell>
                                            {cliente.tiene_cuenta ? (
                                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                                                    Con cuenta
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700">
                                                    Invitado
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500 hidden lg:table-cell">
                                            {cliente.ultima_ciudad ?? '—'}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {cliente.ultimo_estado
                                                ? <StatusBadge estado={cliente.ultimo_estado} />
                                                : <span className="text-xs text-slate-500">—</span>
                                            }
                                        </TableCell>
                                        <TableCell className="text-right text-slate-700 hidden md:table-cell">{cliente.orders_count}</TableCell>
                                        <TableCell className="text-right font-bold text-slate-900 hidden lg:table-cell">
                                            {formatPrecio(cliente.orders_sum_total ?? 0)}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-slate-500 hidden xl:table-cell">
                                            {cliente.orders_count > 0 ? formatPrecio(ticketPromedio) : '—'}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <a
                                                href={whatsappLink(cliente.telefono)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-colors duration-200"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Paginación */}
            {clientes.last_page > 1 && (
                <Pagination className="mt-4">
                    <PaginationContent>
                        <PaginationItem>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={clientes.current_page === 1}
                                onClick={() => irAPagina(clientes.current_page - 1)}
                                aria-label="Página anterior"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                        </PaginationItem>
                        {paginas.map((p, i) => (
                            <PaginationItem key={`${p}-${i}`}>
                                {p === 'ellipsis' ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <Button
                                        variant={p === clientes.current_page ? 'outline' : 'ghost'}
                                        size="icon"
                                        onClick={() => irAPagina(p)}
                                    >
                                        {p}
                                    </Button>
                                )}
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={clientes.current_page === clientes.last_page}
                                onClick={() => irAPagina(clientes.current_page + 1)}
                                aria-label="Página siguiente"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
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
