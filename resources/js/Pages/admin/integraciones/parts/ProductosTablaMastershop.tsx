import { useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Link as LinkIcon, Unlink, Package } from 'lucide-react'
import { Button } from '@/Components/ui/Button'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/Components/ui/Empty'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/Table'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
} from '@/Components/ui/Pagination'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/Tooltip'
import { rangoPaginacion } from '@/lib/utils'

export interface GrupoVariante {
    id:     number
    nombre: string
    items:  Array<{
        id:                     number
        nombre:                 string
        mastershop_id_variant:  number | null
    }>
}

export interface ProductoMastershop {
    id:                     number
    nombre:                 string
    sku:                    string | null
    slug:                   string | null
    status:                 string
    mastershop_id_product:  number | null
    mastershop_id_variant:  number | null
    tiene_variantes:        boolean
    variantes_vinculadas:   number
    variantes_total:        number
    grupos_variantes:       GrupoVariante[]
}

export interface ProductosPaginado {
    data:         ProductoMastershop[]
    current_page: number
    last_page:    number
    per_page:     number
    total:        number
}

interface Props {
    productos:         ProductosPaginado
    apiKeyConfigurada: boolean
    puedeVincular:     boolean
    onVincular:        (p: ProductoMastershop) => void
}

export default function ProductosTablaMastershop({ productos, apiKeyConfigurada, puedeVincular, onVincular }: Props) {

    // El propio objeto (no solo el id) — necesario para mostrar el nombre del
    // producto en la descripción del AlertDialog de confirmación.
    const [aDesvincular, setADesvincular] = useState<ProductoMastershop | null>(null)
    const [eliminando,   setEliminando]   = useState(false)

    function ejecutarDesvincular() {
        if (!aDesvincular) return
        setEliminando(true)
        router.delete(route('admin.integraciones.mastershop.desvincular', aDesvincular.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Vinculación eliminada')
                setADesvincular(null)
            },
            onError:  () => toast.error('Error al desvincular'),
            onFinish: () => setEliminando(false),
        })
    }

    function irAPagina(page: number) {
        if (page < 1 || page > productos.last_page) return
        router.get(route('admin.integraciones.mastershop'), { page }, {
            preserveScroll: true,
            preserveState:  true,
        })
    }

    if (productos.total === 0) {
        return (
            <Empty className="border border-dashed border-slate-200 bg-white">
                <EmptyHeader>
                    <EmptyMedia variant="icon"><Package /></EmptyMedia>
                    <EmptyTitle>No hay productos creados todavía</EmptyTitle>
                    <EmptyDescription>
                        Creá productos primero para poder vincularlos con Mastershop.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button variant="outline" asChild>
                        <a href={route('admin.productos.index')}>Ir a productos</a>
                    </Button>
                </EmptyContent>
            </Empty>
        )
    }

    const vinculadosEnPagina = productos.data.filter(p => p.mastershop_id_product !== null).length
    const paginas = rangoPaginacion(productos.current_page, productos.last_page)

    return (
        <>
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">

                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">Productos Linkiu</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {productos.total} en total · {vinculadosEnPagina} vinculado{vinculadosEnPagina !== 1 ? 's' : ''} en esta página
                    </p>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {productos.data.map(p => (
                            <FilaProducto
                                key={p.id}
                                producto={p}
                                puedeVincular={puedeVincular}
                                apiKeyConfigurada={apiKeyConfigurada}
                                onVincular={() => onVincular(p)}
                                onDesvincular={() => setADesvincular(p)}
                            />
                        ))}
                    </TableBody>
                </Table>

            </div>

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

            <AlertDialog open={!!aDesvincular} onOpenChange={v => !v && setADesvincular(null)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desvincular producto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará la vinculación de <strong className="text-slate-900">{aDesvincular?.nombre}</strong> con
                            Mastershop, incluyendo los mapeos de variantes. Esta acción no es reversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={ejecutarDesvincular} disabled={eliminando}>
                            Desvincular
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

function FilaProducto({
    producto, puedeVincular, apiKeyConfigurada, onVincular, onDesvincular,
}: {
    producto:          ProductoMastershop
    puedeVincular:     boolean
    apiKeyConfigurada: boolean
    onVincular:        () => void
    onDesvincular:     () => void
}) {
    const vinculado = producto.mastershop_id_product !== null
    const variantesIncompletas = producto.tiene_variantes
        && producto.variantes_vinculadas < producto.variantes_total

    // Política AGENTS.md: nunca ocultar botones, siempre disabled + tooltip explicativo.
    // El botón Vincular requiere ambos: permiso (puedeVincular) + API key configurada.
    const disabledVincular = !puedeVincular || !apiKeyConfigurada
    const tooltipDisabled  = !puedeVincular
        ? 'No tenés permiso para editar productos'
        : 'Configurá la API key de Mastershop primero'

    return (
        <TableRow>
            <TableCell>
                <p className="font-medium text-slate-900">{producto.nombre}</p>
                {producto.tiene_variantes && (
                    <p className="text-xs text-slate-500 mt-0.5">
                        {producto.variantes_total} variante{producto.variantes_total !== 1 ? 's' : ''}
                    </p>
                )}
            </TableCell>
            <TableCell>
                <span className="text-xs text-slate-500 font-mono">{producto.sku ?? '—'}</span>
            </TableCell>
            <TableCell>
                {!vinculado && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5">
                        Sin vincular
                    </span>
                )}
                {vinculado && variantesIncompletas && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                        Vinculado · {producto.variantes_vinculadas}/{producto.variantes_total} variantes
                    </span>
                )}
                {vinculado && !variantesIncompletas && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                        Vinculado
                    </span>
                )}
            </TableCell>
            <TableCell className="text-right">
                <div className="inline-flex items-center gap-1.5">
                    {disabledVincular ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                {/* span wrapper para que el tooltip funcione sobre un button disabled */}
                                <span>
                                    <Button variant="outline" size="sm" disabled>
                                        <LinkIcon className="w-3.5 h-3.5 mr-1" />
                                        {vinculado ? 'Editar' : 'Vincular'}
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>{tooltipDisabled}</TooltipContent>
                        </Tooltip>
                    ) : (
                        <Button variant="outline" size="sm" onClick={onVincular}>
                            <LinkIcon className="w-3.5 h-3.5 mr-1" />
                            {vinculado ? 'Editar' : 'Vincular'}
                        </Button>
                    )}
                    {vinculado && puedeVincular && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDesvincular}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Unlink className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    )
}
