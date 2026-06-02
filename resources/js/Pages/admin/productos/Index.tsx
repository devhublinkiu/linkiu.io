import { useEffect, useRef, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { Plus, Search, Pencil, Eye, Zap, PackageOpen, Package, Trash2, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/Table'
import {
    Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
} from '@/Components/ui/Pagination'
import {
    Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
} from '@/Components/ui/Empty'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import { rangoPaginacion } from '@/lib/utils'
import { GlosarioPerformance } from './parts/performance/GlosarioPerformance'
import { ScoreBadge } from './parts/performance/ScoreBadge'
import { SenalIcon } from './parts/performance/SenalIcon'
import { Temperatura } from './parts/performance/Temperatura'
import { TendenciaBadge } from './parts/performance/TendenciaBadge'
import { ValorBadge } from './parts/performance/ValorBadge'
import type { PerformanceDebug, Senal, Tendencia } from './parts/performance/types'

interface Producto {
    id:                 number
    nombre:             string
    slug:               string
    sku:                string | null
    status:             'activo' | 'borrador'
    precio_base:        number | null
    imagen:             string | null
    hooks_activos:      number
    categoria:          string | null
    vendidos:           number
    score:              number | null
    conversion_pct:     number | null
    valor:              number | null
    revenue_7d:         number
    temperatura:        number
    tendencia:          Tendencia
    senal:              Senal | null
    performance_debug:  PerformanceDebug
    ventas_7d:          number
    vistas_7d:          number
    scroll_promedio:    number
}

interface Paginado<T> {
    data:         T[]
    current_page: number
    last_page:    number
    total:        number
    from:         number | null
    to:           number | null
}

interface Props {
    productos: Paginado<Producto>
    filtros:   { busqueda: string; filtro: string }
}

const FILTROS = [
    { key: 'todos',    label: 'Todos'      },
    { key: 'activo',   label: 'Activos'    },
    { key: 'borrador', label: 'Borradores' },
]

export default function ProductosIndex({ productos, filtros }: Props) {
    const { props } = usePage<{ auth: { permissions: string[] } }>()
    const [busqueda,        setBusqueda]        = useState(filtros.busqueda)
    const [filtro,          setFiltro]          = useState(filtros.filtro)
    const [productoEliminar, setProductoEliminar] = useState<Producto | null>(null)
    const mounted = useRef(false)

    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)

    useEffect(() => {
        if (!mounted.current) { mounted.current = true; return }
        const t = setTimeout(() => {
            router.get(
                route('admin.productos.index'),
                { busqueda: busqueda || undefined, filtro: filtro !== 'todos' ? filtro : undefined },
                { preserveState: true, replace: true },
            )
        }, 350)
        return () => clearTimeout(t)
    }, [busqueda])

    function cambiarFiltro(v: string) {
        setFiltro(v)
        router.get(
            route('admin.productos.index'),
            { busqueda: busqueda || undefined, filtro: v !== 'todos' ? v : undefined },
            { preserveState: true, replace: true },
        )
    }

    function irAPagina(page: number) {
        router.get(
            route('admin.productos.index'),
            { busqueda: busqueda || undefined, filtro: filtro !== 'todos' ? filtro : undefined, page },
            { preserveState: true, replace: true },
        )
    }

    function formatPrecio(v: number | null) {
        if (v == null) return '—'
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
    }

    function confirmarEliminar() {
        if (!productoEliminar) return
        router.delete(route('admin.productos.destroy', productoEliminar.id), {
            preserveScroll: true,
            onSuccess: () => { toast.success('Producto eliminado'); setProductoEliminar(null) },
            onError:   () => { toast.error('Error al eliminar el producto'); setProductoEliminar(null) },
        })
    }

    const estaVacio = productos.total === 0 && !filtros.busqueda && filtros.filtro === 'todos'
    const paginas = rangoPaginacion(productos.current_page, productos.last_page)

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Panel', href: route('admin.dashboard') },
                { label: 'Productos' },
            ]}
        >
            <Head title="Productos" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Productos</h1>
                        <p className="text-xs text-slate-500">{productos.total} en total</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Buscar por nombre o SKU…"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            className="pl-9 w-64"
                        />
                    </div>
                    <GlosarioPerformance />
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        size="sm"
                                        onClick={() => router.visit(route('admin.productos.create'))}
                                        disabled={!puede('productos.crear')}
                                    >
                                        <Plus className="size-4" />
                                        Crear producto
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {!puede('productos.crear') && (
                                <TooltipContent>No tienes permiso para crear productos</TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {estaVacio ? (

                <Empty className="border border-dashed border-slate-200 bg-white">
                    <EmptyHeader>
                        <EmptyMedia variant="icon"><PackageOpen /></EmptyMedia>
                        <EmptyTitle>Sin productos aún</EmptyTitle>
                        <EmptyDescription>Crea tu primer producto para empezar.</EmptyDescription>
                    </EmptyHeader>
                    {puede('productos.crear') && (
                        <EmptyContent>
                            <Button size="sm" onClick={() => router.visit(route('admin.productos.create'))}>
                                <Plus className="size-4" /> Crear producto
                            </Button>
                        </EmptyContent>
                    )}
                </Empty>

            ) : (

                <>
                    {/* Tabs de filtro */}
                    <div className="flex items-center gap-1 mb-4 border-b border-slate-200">
                        {FILTROS.map(f => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => cambiarFiltro(f.key)}
                                className={`px-3 py-2 text-xs font-medium transition-colors duration-200 border-b-2 -mb-px ${
                                    filtro === f.key
                                        ? 'border-slate-900 text-slate-900'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <TooltipProvider delayDuration={200}>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12" />
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Precio base</TableHead>
                                        <TableHead>Vendidos</TableHead>
                                        <TableHead>Hooks</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Temperatura</TableHead>
                                        <TableHead>Tendencia</TableHead>
                                        <TableHead>Señal</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productos.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={11} className="text-center text-sm text-slate-500 py-12">
                                                Sin resultados{busqueda ? ` para "${busqueda}"` : ''}
                                            </TableCell>
                                        </TableRow>
                                    ) : productos.data.map(p => {
                                        const subtitleParts = [
                                            p.sku ? `SKU: ${p.sku}` : null,
                                            p.categoria,
                                        ].filter(Boolean)

                                        return (
                                        <TableRow
                                            key={p.id}
                                            onClick={() => puede('productos.editar') && router.visit(route('admin.productos.edit', p.id))}
                                            className="group cursor-pointer"
                                        >
                                            <TableCell>
                                                <div className="size-10 rounded-md border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                                                    {p.imagen
                                                        ? <img src={p.imagen} alt={p.nombre} className="size-full object-cover" />
                                                        : <div className="size-full flex items-center justify-center"><PackageOpen className="size-4 text-slate-300" /></div>
                                                    }
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <p className="font-medium text-slate-900 leading-tight">{p.nombre}</p>
                                                {subtitleParts.length > 0 && (
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {subtitleParts.join(' · ')}
                                                    </p>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    p.status === 'activo'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {p.status === 'activo' ? 'Activo' : 'Borrador'}
                                                </span>
                                            </TableCell>

                                            <TableCell className="font-medium text-slate-700">
                                                {formatPrecio(p.precio_base)}
                                            </TableCell>

                                            <TableCell>
                                                {p.vendidos > 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                                                        <ShoppingBag className="size-3 text-slate-400" />
                                                        {p.vendidos}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-500">—</span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {p.hooks_activos > 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                                                        <Zap className="size-3" />
                                                        {p.hooks_activos}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-500">—</span>
                                                )}
                                            </TableCell>

                                            <TableCell onClick={e => e.stopPropagation()}>
                                                <ScoreBadge score={p.score} conversionPct={p.conversion_pct} debug={p.performance_debug} />
                                            </TableCell>

                                            <TableCell onClick={e => e.stopPropagation()}>
                                                <ValorBadge valor={p.valor} revenue7d={p.revenue_7d} debug={p.performance_debug} />
                                            </TableCell>

                                            <TableCell onClick={e => e.stopPropagation()}>
                                                <Temperatura score={p.temperatura} debug={p.performance_debug} />
                                            </TableCell>

                                            <TableCell onClick={e => e.stopPropagation()}>
                                                <TendenciaBadge
                                                    tendencia={p.tendencia}
                                                    ventas_actual={p.performance_debug.ventas_7d}
                                                    ventas_baseline={Math.round(p.performance_debug.ventas_7d / Math.max(1 + p.tendencia.pct / 100, 0.01))}
                                                />
                                            </TableCell>

                                            <TableCell onClick={e => e.stopPropagation()}>
                                                <SenalIcon senal={p.senal} />
                                            </TableCell>

                                            <TableCell onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                onClick={() => window.open(route('producto.show', { slug: p.slug }), '_blank')}
                                                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200"
                                                            >
                                                                <Eye className="size-3.5" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Ver en tienda</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span>
                                                                <button
                                                                    type="button"
                                                                    disabled={!puede('productos.editar')}
                                                                    onClick={() => router.visit(route('admin.productos.edit', p.id))}
                                                                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                                                >
                                                                    <Pencil className="size-3.5" />
                                                                </button>
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {puede('productos.editar') ? 'Editar' : 'No tienes permiso para editar'}
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span>
                                                                <button
                                                                    type="button"
                                                                    disabled={!puede('productos.eliminar')}
                                                                    onClick={() => setProductoEliminar(p)}
                                                                    className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </button>
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {puede('productos.eliminar') ? 'Eliminar' : 'No tienes permiso para eliminar'}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </TooltipProvider>

                    {/* Paginación */}
                    {productos.last_page > 1 && (
                        <Pagination className="mt-4">
                            <PaginationContent>
                                <PaginationItem>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={productos.current_page === 1}
                                        onClick={() => irAPagina(productos.current_page - 1)}
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
                                                variant={p === productos.current_page ? 'outline' : 'ghost'}
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
                                        disabled={productos.current_page === productos.last_page}
                                        onClick={() => irAPagina(productos.current_page + 1)}
                                        aria-label="Página siguiente"
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}

            {/* AlertDialog eliminar */}
            <AlertDialog open={!!productoEliminar} onOpenChange={open => { if (!open) setProductoEliminar(null) }}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar "{productoEliminar?.nombre}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción es irreversible. Se eliminarán también sus imágenes, variables y hooks configurados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={confirmarEliminar}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </AdminLayout>
    )
}
