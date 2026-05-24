import { type ReactNode, useEffect, useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, FileText, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
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
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import { rangoPaginacion } from '@/lib/utils'

interface Post {
    id:                   number
    titulo:               string
    slug:                 string
    estado:               string
    published_at:         string | null
    imagen_destacada_url: string | null
    created_at:           string
}

interface Paginado<T> {
    data:         T[]
    current_page: number
    last_page:    number
    total:        number
    from:         number | null
    to:           number | null
}

interface Props { posts: Paginado<Post> }

function ImagenOPlaceholder({ url, titulo }: { url: string | null; titulo: string }) {
    if (url) {
        return <img src={url} alt={titulo} className="size-10 shrink-0 rounded object-cover border border-slate-200" />
    }
    return (
        <div className="flex size-10 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-400">
            <FileText className="size-4" />
        </div>
    )
}

export default function BlogIndex({ posts }: Props) {
    const { props } = usePage<{ auth: { permissions: string[] }; flash?: { status?: string } }>()
    const puede = (p: string) => props.auth.permissions.includes('*') || props.auth.permissions.includes(p)

    const [eliminar, setEliminar] = useState<Post | null>(null)

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    function irAPagina(page: number) {
        router.get(route('admin.blogs.index'), { page }, { preserveState: true, replace: true })
    }

    function confirmarEliminar() {
        if (!eliminar) return
        if (!puede('blogs.eliminar')) return

        router.delete(route('admin.blogs.destroy', eliminar.id), {
            preserveScroll: true,
            onSuccess: () => setEliminar(null),
            onError: (errs) => {
                toast.error((errs.general as string | undefined) ?? 'No se pudo eliminar el post')
                setEliminar(null)
            },
        })
    }

    const paginas = rangoPaginacion(posts.current_page, posts.last_page)

    return (
        <>
            <Head title="Blog" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Blog</h1>
                        <p className="text-xs text-slate-500">{posts.total} {posts.total === 1 ? 'post' : 'posts'} en total</p>
                    </div>
                </div>
                <TooltipProvider delayDuration={200}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button size="sm" asChild disabled={!puede('blogs.crear')}>
                                    <Link href={route('admin.blogs.create')}>
                                        <Plus className="size-4" />
                                        Nuevo post
                                    </Link>
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {!puede('blogs.crear') && <TooltipContent>No tienes permiso para crear posts</TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Tabla o Empty */}
            {posts.data.length === 0 ? (
                <Empty className="border border-dashed border-slate-200 bg-white">
                    <EmptyHeader>
                        <EmptyMedia variant="icon"><FileText /></EmptyMedia>
                        <EmptyTitle>Aún no hay posts</EmptyTitle>
                        <EmptyDescription>
                            Crea el primer post para empezar a publicar contenido en tu blog.
                        </EmptyDescription>
                    </EmptyHeader>
                    {puede('blogs.crear') && (
                        <EmptyContent>
                            <Button size="sm" asChild>
                                <Link href={route('admin.blogs.create')}>
                                    <Plus className="size-4" />
                                    Nuevo post
                                </Link>
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
                                    <TableHead>Post</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts.data.map(post => (
                                    <TableRow key={post.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <ImagenOPlaceholder url={post.imagen_destacada_url} titulo={post.titulo} />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-900 truncate">{post.titulo}</p>
                                                    <p className="text-xs font-mono text-slate-500 truncate">/{post.slug}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {post.estado === 'publicado' ? (
                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                                    Publicado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                    Borrador
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500">
                                            {post.published_at
                                                ? formatDistanceToNow(new Date(post.published_at), { locale: es, addSuffix: true })
                                                : `creado ${formatDistanceToNow(new Date(post.created_at), { locale: es, addSuffix: true })}`}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                {post.estado === 'publicado' && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <a
                                                                href={`/blog/${post.slug}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200"
                                                            >
                                                                <ExternalLink className="size-3.5" />
                                                            </a>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left">Ver post público</TooltipContent>
                                                    </Tooltip>
                                                )}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            <Link
                                                                href={route('admin.blogs.edit', post.id)}
                                                                className={`inline-flex rounded-md p-1.5 transition-colors duration-200 ${puede('blogs.editar') ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700' : 'text-slate-300 cursor-not-allowed pointer-events-none'}`}
                                                            >
                                                                <Pencil className="size-3.5" />
                                                            </Link>
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left">
                                                        {puede('blogs.editar') ? 'Editar' : 'No tienes permiso para editar'}
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            <button
                                                                onClick={() => puede('blogs.eliminar') && setEliminar(post)}
                                                                disabled={!puede('blogs.eliminar')}
                                                                className="rounded-md p-1.5 text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left">
                                                        {puede('blogs.eliminar') ? 'Eliminar' : 'No tienes permiso para eliminar'}
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
            {posts.last_page > 1 && (
                <Pagination className="mt-4">
                    <PaginationContent>
                        <PaginationItem>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={posts.current_page === 1}
                                onClick={() => irAPagina(posts.current_page - 1)}
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
                                        variant={p === posts.current_page ? 'outline' : 'ghost'}
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
                                disabled={posts.current_page === posts.last_page}
                                onClick={() => irAPagina(posts.current_page + 1)}
                                aria-label="Página siguiente"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            <AlertDialog open={!!eliminar} onOpenChange={open => !open && setEliminar(null)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar este post?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vas a eliminar <strong>"{eliminar?.titulo}"</strong>. Esta acción no se puede deshacer.
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
        </>
    )
}

BlogIndex.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Blog' },
    ]}>{page}</AdminLayout>
)
