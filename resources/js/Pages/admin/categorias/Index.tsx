import { useState, useEffect } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { ChevronLeft, ChevronRight, Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
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
import AddCategoryModal from './parts/AddCategoryModal'
import EditCategoryModal from './parts/EditCategoryModal'

interface Categoria {
    id:             number
    name:           string
    slug:           string
    parent_id:      number | null
    parent_name:    string | null
    status:         string
    image_url:      string | null
    description:    string | null
    children_count: number
    products_count: number
}

interface Padre { id: number; name: string }

interface Paginado<T> {
    data:         T[]
    current_page: number
    last_page:    number
    total:        number
    from:         number | null
    to:           number | null
}

interface Props {
    categorias: Paginado<Categoria>
    padres:     Padre[]
}

function ImagenOInicial({ name, url }: { name: string; url: string | null }) {
    if (url) {
        return <img src={url} alt={name} className="size-8 shrink-0 rounded-md object-cover border border-slate-200" />
    }
    return (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-200 text-xs font-semibold uppercase text-slate-600">
            {name[0]}
        </div>
    )
}

export default function CategoriasIndex({ categorias, padres }: Props) {
    const [addOpen,    setAddOpen]    = useState(false)
    const [editTarget, setEditTarget] = useState<Categoria | null>(null)
    const [eliminar,   setEliminar]   = useState<Categoria | null>(null)

    const { props } = usePage<{ auth: { permissions: string[] }; flash?: { status?: string } }>()
    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    function irAPagina(page: number) {
        router.get(route('admin.categorias.index'), { page }, { preserveState: true, replace: true })
    }

    function confirmarDelete() {
        if (!eliminar) return
        router.delete(route('admin.categorias.destroy', eliminar.id), {
            preserveScroll: true,
            onSuccess: () => setEliminar(null),
            onError: (errors) => {
                toast.error((errors.general as string | undefined) ?? 'No se pudo eliminar la categoría')
                setEliminar(null)
            },
        })
    }

    const paginas = rangoPaginacion(categorias.current_page, categorias.last_page)

    return (
        <AdminLayout breadcrumbs={[
            { label: 'Panel', href: route('admin.dashboard') },
            { label: 'Categorías' },
        ]}>
            <Head title="Categorías" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Categorías</h1>
                        <p className="text-xs text-slate-500">{categorias.total} en total</p>
                    </div>
                </div>
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button size="sm" onClick={() => setAddOpen(true)} disabled={!puede('categorias.crear')}>
                                    <Plus className="size-4" />
                                    Agregar categoría
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {!puede('categorias.crear') && (
                            <TooltipContent>No tienes permiso para crear categorías</TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Tabla o Empty */}
            {categorias.data.length === 0 ? (
                <Empty className="border border-dashed border-slate-200 bg-white">
                    <EmptyHeader>
                        <EmptyMedia variant="icon"><Tag /></EmptyMedia>
                        <EmptyTitle>No hay categorías aún</EmptyTitle>
                        <EmptyDescription>
                            Crea tu primera categoría para organizar tus productos.
                        </EmptyDescription>
                    </EmptyHeader>
                    {puede('categorias.crear') && (
                        <EmptyContent>
                            <Button size="sm" onClick={() => setAddOpen(true)}>
                                <Plus className="size-4" />
                                Agregar categoría
                            </Button>
                        </EmptyContent>
                    )}
                </Empty>
            ) : (
                <TooltipProvider delayDuration={200}>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Productos</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categorias.data.map(cat => (
                                    <TableRow key={cat.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <ImagenOInicial name={cat.name} url={cat.image_url} />
                                                <div>
                                                    <p className="font-medium text-slate-900">{cat.name}</p>
                                                    {cat.parent_name && (
                                                        <p className="text-xs text-slate-500">en {cat.parent_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-slate-500">{cat.slug}</TableCell>
                                        <TableCell>
                                            {cat.parent_id ? (
                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                    Subcategoría
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                    Categoría
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {cat.products_count > 0 ? (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                                    {cat.products_count}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 text-xs">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {cat.status === 'activo' ? (
                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                                                    Inactivo
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            <button
                                                                onClick={() => puede('categorias.editar') && setEditTarget(cat)}
                                                                disabled={!puede('categorias.editar')}
                                                                className="rounded-md p-1.5 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none"
                                                            >
                                                                <Pencil className="size-3.5" />
                                                            </button>
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left">
                                                        {puede('categorias.editar') ? 'Editar' : 'No tienes permiso para editar categorías'}
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            <button
                                                                onClick={() => puede('categorias.eliminar') && cat.children_count === 0 && cat.products_count === 0 && setEliminar(cat)}
                                                                disabled={!puede('categorias.eliminar') || cat.children_count > 0 || cat.products_count > 0}
                                                                className="rounded-md p-1.5 text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left">
                                                        {!puede('categorias.eliminar')
                                                            ? 'No tienes permiso para eliminar categorías'
                                                            : cat.children_count > 0
                                                                ? 'Elimina primero las subcategorías'
                                                                : cat.products_count > 0
                                                                    ? `Tiene ${cat.products_count} producto${cat.products_count !== 1 ? 's' : ''} asociado${cat.products_count !== 1 ? 's' : ''}`
                                                                    : 'Eliminar'}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TooltipProvider>
            )}

            {/* Paginación */}
            {categorias.last_page > 1 && (
                <Pagination className="mt-4">
                    <PaginationContent>
                        <PaginationItem>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={categorias.current_page === 1}
                                onClick={() => irAPagina(categorias.current_page - 1)}
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
                                        variant={p === categorias.current_page ? 'outline' : 'ghost'}
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
                                disabled={categorias.current_page === categorias.last_page}
                                onClick={() => irAPagina(categorias.current_page + 1)}
                                aria-label="Página siguiente"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            {/* Modals */}
            <AddCategoryModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                padres={padres}
            />
            <EditCategoryModal
                open={!!editTarget}
                onClose={() => setEditTarget(null)}
                categoria={editTarget}
                padres={padres}
            />
            <AlertDialog open={!!eliminar} onOpenChange={open => !open && setEliminar(null)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de eliminar <strong>{eliminar?.name}</strong>. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={confirmarDelete}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    )
}
