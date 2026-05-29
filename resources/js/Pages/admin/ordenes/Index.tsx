import { type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Download, Search, Send, ShieldAlert, ShoppingCart } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Badge } from '@/Components/ui/Badge'
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
import MotivoRevisionBadge from './parts/MotivoRevisionBadge'
import ConfirmacionCodBadge, {
    calcularEstadoConfirmacion,
    puedeReenviarConfirmacion,
} from './parts/ConfirmacionCodBadge'

type RevisionEstado = 'pendiente' | 'aprobada' | 'rechazada' | null
type RespuestaCod   = 'si' | 'no' | null

interface OrdenResumen {
    id:                          number
    codigo:                      string
    estado:                      Estado
    nombre:                      string
    apellido:                    string
    email:                       string
    ciudad:                      string
    total:                       number
    metodo_pago:                 string
    created_at:                  string
    revision_estado:             RevisionEstado
    revision_motivos:            string[] | null
    confirmacion_solicitada_at:  string | null
    confirmacion_reenviada:      boolean
    confirmacion_respondida_at:  string | null
    confirmacion_respuesta:      RespuestaCod
}

interface Paginado {
    data:         OrdenResumen[]
    current_page: number
    last_page:    number
    per_page:     number
    total:        number
}

interface Props {
    ordenes:         Paginado
    filtroEstado:    string
    filtroRevision:  string
    filtroQ:         string
    totalPendientes: number
    totalRevision:   number
}

const ESTADOS = [
    { value: '',           label: 'Todas'       },
    { value: 'pendiente',  label: 'Pendientes'  },
    { value: 'confirmado', label: 'Confirmadas' },
    // 'preparando' oculto del UI (Capa 3) — se reactiva cuando se reestructure el flujo
    { value: 'enviado',    label: 'Enviadas'    },
    { value: 'entregado',  label: 'Entregadas'  },
    { value: 'cancelado',  label: 'Canceladas'  },
    { value: 'devuelto',   label: 'Devueltas'   },
]

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function formatFecha(iso: string) {
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function OrdenesList() {
    const { ordenes, filtroEstado, filtroRevision, filtroQ, totalPendientes, totalRevision } = usePage<Props>().props

    // Estamos en el tab "Revisión" cuando hay filtroRevision activo. Excluyente
    // con los filtros por estado para no enredar la UI.
    const enRevision = filtroRevision === 'pendiente'

    function filtrarPorEstado(estado: string) {
        router.get(route('admin.ordenes.index'), { estado, q: filtroQ }, { preserveState: true, replace: true })
    }

    function filtrarRevision() {
        router.get(route('admin.ordenes.index'), { revision: 'pendiente', q: filtroQ }, { preserveState: true, replace: true })
    }

    function buscar(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value
        const params: Record<string, string> = { q }
        if (enRevision)          params.revision = 'pendiente'
        else if (filtroEstado)   params.estado   = filtroEstado
        router.get(route('admin.ordenes.index'), params, { preserveState: true, replace: true })
    }

    function irAPagina(page: number) {
        const params: Record<string, string | number> = { q: filtroQ, page }
        if (enRevision)          params.revision = 'pendiente'
        else if (filtroEstado)   params.estado   = filtroEstado
        router.get(route('admin.ordenes.index'), params, { preserveState: true, replace: true })
    }

    function reenviarConfirmacion(ordenId: number) {
        router.post(
            route('admin.ordenes.confirmacion.reenviar', ordenId),
            {},
            {
                preserveScroll: true,
                onError: () => toast.error('Error al reenviar la confirmación'),
            },
        )
    }

    const paginas = rangoPaginacion(ordenes.current_page, ordenes.last_page)
    const sinOrdenes    = ordenes.total === 0 && !filtroEstado && !filtroQ && !enRevision
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
                        <p className="text-xs text-slate-500">
                            {ordenes.total} en total · {totalPendientes} pendientes
                            {totalRevision > 0 && (
                                <span className="text-amber-700"> · {totalRevision} en revisión</span>
                            )}
                        </p>
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

            {/* Tabs de estado + tab Revisión separado */}
            <div className="flex items-center gap-1 mb-4 border-b border-slate-200">
                {ESTADOS.map(e => (
                    <button
                        key={e.value}
                        onClick={() => filtrarPorEstado(e.value)}
                        className={`px-3 py-2 text-xs font-medium transition-colors duration-200 border-b-2 -mb-px ${
                            !enRevision && filtroEstado === e.value
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {e.label}
                    </button>
                ))}
                {totalRevision > 0 && (
                    <button
                        onClick={filtrarRevision}
                        className={`ml-2 px-3 py-2 text-xs font-medium transition-colors duration-200 border-b-2 -mb-px inline-flex items-center gap-1.5 ${
                            enRevision
                                ? 'border-amber-600 text-amber-700'
                                : 'border-transparent text-amber-700 hover:text-amber-800'
                        }`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Revisión
                        <Badge className="bg-amber-100 text-amber-700">
                            {totalRevision}
                        </Badge>
                    </button>
                )}
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
                        <EmptyMedia variant="icon">{enRevision ? <ShieldAlert /> : <Search />}</EmptyMedia>
                        <EmptyTitle>{enRevision ? 'No hay órdenes en revisión' : 'Sin resultados'}</EmptyTitle>
                        <EmptyDescription>
                            {enRevision
                                ? 'Todas las órdenes pasaron los filtros antifraude automáticamente.'
                                : `No hay órdenes${filtroEstado ? ` con estado "${filtroEstado}"` : ''}${filtroQ ? ` para "${filtroQ}"` : ''}.`}
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
                                <TableHead className="text-right">Acciones</TableHead>
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
                                        <div className="flex flex-wrap items-center gap-1">
                                            <StatusBadge estado={orden.estado} />
                                            {orden.revision_estado === 'pendiente' && orden.revision_motivos?.map(m => (
                                                <MotivoRevisionBadge key={m} motivo={m} />
                                            ))}
                                            {(() => {
                                                const ec = calcularEstadoConfirmacion(orden)
                                                return ec ? <ConfirmacionCodBadge estado={ec} /> : null
                                            })()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 hidden sm:table-cell">{formatFecha(orden.created_at)}</TableCell>
                                    <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                                        {puedeReenviarConfirmacion(orden) && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => reenviarConfirmacion(orden.id)}
                                            >
                                                <Send className="w-3.5 h-3.5 mr-1" />
                                                Reenviar
                                            </Button>
                                        )}
                                    </TableCell>
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
