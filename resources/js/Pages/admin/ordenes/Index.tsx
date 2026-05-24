import { type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { ChevronLeft, ChevronRight, Download, Search, ShoppingCart } from 'lucide-react'
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
import StatusBadge, { type Estado } from './parts/StatusBadge'

interface OrdenResumen {
    id: number
    codigo: string
    estado: Estado
    nombre: string
    apellido: string
    email: string
    ciudad: string
    total: number
    metodo_pago: string
    created_at: string
}

interface Paginado {
    data:         OrdenResumen[]
    current_page: number
    last_page:    number
    per_page:     number
    total:        number
    links:        { url: string | null; label: string; active: boolean }[]
}

interface Props {
    ordenes:         Paginado
    filtroEstado:    string
    filtroQ:         string
    totalPendientes: number
}

const ESTADOS = [
    { value: '',           label: 'Todas'       },
    { value: 'pendiente',  label: 'Pendientes'  },
    { value: 'confirmado', label: 'Confirmadas' },
    { value: 'preparando', label: 'Preparando'  },
    { value: 'enviado',    label: 'Enviadas'    },
    { value: 'entregado',  label: 'Entregadas'  },
    { value: 'cancelado',  label: 'Canceladas'  },
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

    function irAPagina(page: number) {
        router.get(route('admin.ordenes.index'), { estado: filtroEstado, q: filtroQ, page }, { preserveState: true, replace: true })
    }

    const paginas = rangoPaginacion(ordenes.current_page, ordenes.last_page)
    const sinOrdenes    = ordenes.total === 0 && !filtroEstado && !filtroQ
    const sinResultados = ordenes.data.length === 0 && !sinOrdenes

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
                        <p className="text-xs text-slate-500">{ordenes.total} en total · {totalPendientes} pendientes</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <form onSubmit={buscar}>
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
                    <Button variant="outline" size="sm" asChild>
                        <a href={route('admin.ordenes.export', { estado: filtroEstado || undefined, q: filtroQ || undefined })}>
                            <Download className="w-3.5 h-3.5" />
                            Exportar
                        </a>
                    </Button>
                </div>
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

            {/* Tabla o Empty */}
            {sinOrdenes ? (
                <Empty className="border border-dashed border-slate-200 bg-white">
                    <EmptyHeader>
                        <EmptyMedia variant="icon"><ShoppingCart /></EmptyMedia>
                        <EmptyTitle>Aún no hay órdenes</EmptyTitle>
                        <EmptyDescription>
                            Cuando un cliente complete una compra, aparecerá aquí.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : sinResultados ? (
                <Empty className="border border-dashed border-slate-200 bg-white">
                    <EmptyHeader>
                        <EmptyMedia variant="icon"><Search /></EmptyMedia>
                        <EmptyTitle>Sin resultados</EmptyTitle>
                        <EmptyDescription>
                            No hay órdenes{filtroEstado ? ` con estado "${filtroEstado}"` : ''}{filtroQ ? ` para "${filtroQ}"` : ''}.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead className="hidden md:table-cell">Ciudad</TableHead>
                                <TableHead className="hidden lg:table-cell">Pago</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ordenes.data.map(orden => (
                                <TableRow
                                    key={orden.id}
                                    className="cursor-pointer"
                                    onClick={() => router.visit(route('admin.ordenes.show', orden.id))}
                                >
                                    <TableCell className="font-mono text-xs font-bold text-slate-900">{orden.codigo}</TableCell>
                                    <TableCell>
                                        <p className="font-medium text-slate-900">{orden.nombre} {orden.apellido}</p>
                                        <p className="text-xs text-slate-500">{orden.email}</p>
                                    </TableCell>
                                    <TableCell className="text-slate-600 hidden md:table-cell">{orden.ciudad}</TableCell>
                                    <TableCell className="text-slate-600 capitalize hidden lg:table-cell">{orden.metodo_pago.replace('_', ' ')}</TableCell>
                                    <TableCell className="text-right font-bold text-slate-900">{formatPrecio(orden.total)}</TableCell>
                                    <TableCell>
                                        <StatusBadge estado={orden.estado} />
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 hidden sm:table-cell">{formatFecha(orden.created_at)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Paginación */}
            {ordenes.last_page > 1 && (
                <Pagination className="mt-4">
                    <PaginationContent>
                        <PaginationItem>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={ordenes.current_page === 1}
                                onClick={() => irAPagina(ordenes.current_page - 1)}
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
                                        variant={p === ordenes.current_page ? 'outline' : 'ghost'}
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
                                disabled={ordenes.current_page === ordenes.last_page}
                                onClick={() => irAPagina(ordenes.current_page + 1)}
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

OrdenesList.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Órdenes' },
    ]}>{page}</AdminLayout>
)

export default OrdenesList
