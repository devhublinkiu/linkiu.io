import { useState, useEffect } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import AddCategoryModal from './parts/AddCategoryModal'
import EditCategoryModal from './parts/EditCategoryModal'

interface Categoria {
    id: number
    name: string
    slug: string
    parent_id: number | null
    parent_name: string | null
    status: string
    image_url: string | null
    description: string | null
    children_count: number
    products_count: number
}

interface Padre {
    id: number
    name: string
}

interface Props {
    categorias: Categoria[]
    padres: Padre[]
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
    const [addOpen, setAddOpen]       = useState(false)
    const [editTarget, setEditTarget] = useState<Categoria | null>(null)
    const [eliminar, setEliminar]     = useState<Categoria | null>(null)

    const { props } = usePage<{ auth: { permissions: string[] }; flash?: { status?: string } }>()

    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    const confirmarDelete = () => {
        if (!eliminar) return
        router.delete(route('admin.categorias.destroy', eliminar.id), {
            preserveScroll: true,
            onSuccess: () => setEliminar(null),
            onError: (e)   => { toast.error(e.general ?? 'No se pudo eliminar la categoría'); setEliminar(null) },
        })
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Panel', href: route('admin.dashboard') },
                { label: 'Categorías' },
            ]}
        >
            <Head title="Categorías" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Categorías</h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Organiza tus productos en categorías y subcategorías.
                    </p>
                </div>
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button
                                    size="sm"
                                    onClick={() => setAddOpen(true)}
                                    disabled={!puede('categorias.crear')}
                                >
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

            <TooltipProvider delayDuration={200}>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-100">
                                <th className="px-4 py-3 text-left font-medium text-slate-500">Categoría</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-500">Slug</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-500">Tipo</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-500">Productos</th>
                                <th className="px-4 py-3 text-left font-medium text-slate-500">Estado</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {categorias.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                                        No hay categorías registradas aún.
                                    </td>
                                </tr>
                            )}
                            {categorias.map(cat => (
                                <tr key={cat.id} className="border-b border-slate-100 bg-white transition-colors duration-200 last:border-0 hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <ImagenOInicial name={cat.name} url={cat.image_url} />
                                            <div>
                                                <p className="font-medium text-slate-900">{cat.name}</p>
                                                {cat.parent_name && (
                                                    <p className="text-xs text-slate-400">en {cat.parent_name}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{cat.slug}</td>
                                    <td className="px-4 py-3">
                                        {cat.parent_id ? (
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                Subcategoría
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                Categoría
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {cat.products_count > 0 ? (
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                                {cat.products_count}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {cat.status === 'activo' ? (
                                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                                                Inactivo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Editar */}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span>
                                                        <button
                                                            onClick={() => puede('categorias.editar') && setEditTarget(cat)}
                                                            disabled={!puede('categorias.editar')}
                                                            className="rounded p-1 text-slate-300 transition-colors duration-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 outline-none"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent side="left">
                                                    {puede('categorias.editar') ? 'Editar' : 'No tienes permiso para editar categorías'}
                                                </TooltipContent>
                                            </Tooltip>

                                            {/* Eliminar */}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span>
                                                        <button
                                                            onClick={() => puede('categorias.eliminar') && cat.children_count === 0 && cat.products_count === 0 && setEliminar(cat)}
                                                            disabled={!puede('categorias.eliminar') || cat.children_count > 0 || cat.products_count > 0}
                                                            className="rounded p-1 text-slate-300 transition-colors duration-200 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 outline-none"
                                                        >
                                                            <Trash2 className="size-4" />
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TooltipProvider>

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
