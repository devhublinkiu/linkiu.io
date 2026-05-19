import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Head, router, usePage } from '@inertiajs/react'
import { Plus, Search, Pencil, Eye, Zap, PackageOpen, Trash2, ShoppingBag, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'

interface Tendencia {
    direccion: 'up' | 'down' | 'neutral'
    pct:       number
}

interface Producto {
    id:             number
    nombre:         string
    slug:           string
    sku:            string | null
    status:         'activo' | 'borrador'
    precio_base:    number | null
    imagen:         string | null
    hooks_activos:  number
    categoria:      string | null
    vendidos:       number
    ventas_7d:      number
    vistas_7d:      number
    scroll_promedio: number
    temperatura:    number
    tendencia:      Tendencia
}

interface Props {
    productos: Producto[]
}

const FILTROS = [
    { key: 'todos',    label: 'Todos'      },
    { key: 'activo',   label: 'Activos'    },
    { key: 'borrador', label: 'Borradores' },
]

function Temperatura({ score, ventas7d, vistas7d, scroll }: { score: number; ventas7d: number; vistas7d: number; scroll: number }) {
    const [rect, setRect] = useState<DOMRect | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    const config =
        score >= 70 ? { color: 'bg-emerald-500', text: 'text-emerald-700', label: 'Caliente', bg: 'bg-emerald-50' } :
        score >= 40 ? { color: 'bg-amber-400',   text: 'text-amber-700',   label: 'Tibio',    bg: 'bg-amber-50'   } :
                      { color: 'bg-slate-300',    text: 'text-slate-500',   label: 'Frío',     bg: 'bg-slate-100'  }

    function handleEnter() {
        if (ref.current) setRect(ref.current.getBoundingClientRect())
    }

    return (
        <div
            ref={ref}
            className="flex flex-col gap-1 w-24 cursor-default"
            onMouseEnter={handleEnter}
            onMouseLeave={() => setRect(null)}
        >
            <div className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold ${config.text}`}>{score}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${config.bg} ${config.text}`}>{config.label}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${config.color}`}
                    style={{ width: `${score}%` }}
                />
            </div>

            {rect && createPortal(
                <div
                    className="fixed z-[9999] w-44 rounded-lg border border-slate-200 bg-white p-3 shadow-lg text-xs pointer-events-none"
                    style={{ top: rect.top - 8, left: rect.left, transform: 'translateY(-100%)' }}
                >
                    <p className="font-semibold text-slate-700 mb-2">Temperatura ({score}/100)</p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-slate-500">
                            <span>Ventas 7 días</span>
                            <span className="font-medium text-slate-700">{ventas7d}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Vistas 7 días</span>
                            <span className="font-medium text-slate-700">{vistas7d}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Scroll prom.</span>
                            <span className="font-medium text-slate-700">{scroll}%</span>
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    )
}

function TendenciaBadge({ tendencia }: { tendencia: Tendencia }) {
    if (tendencia.direccion === 'up') {
        return (
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-700">
                <TrendingUp className="size-3.5" />
                {tendencia.pct > 0 ? `+${tendencia.pct}%` : ''}
            </span>
        )
    }
    if (tendencia.direccion === 'down') {
        return (
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-500">
                <TrendingDown className="size-3.5" />
                {tendencia.pct > 0 ? `-${tendencia.pct}%` : ''}
            </span>
        )
    }
    return <Minus className="size-3.5 text-slate-300" />
}

export default function ProductosIndex({ productos }: Props) {
    const { props } = usePage<{ auth: { permissions: string[] } }>()
    const [busqueda,   setBusqueda]   = useState('')
    const [filtro,     setFiltro]     = useState('todos')
    const [eliminarId, setEliminarId] = useState<number | null>(null)

    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)

    const lista = useMemo(() => {
        let r = productos
        if (filtro !== 'todos') r = r.filter(p => p.status === filtro)
        if (busqueda.trim()) {
            const q = busqueda.toLowerCase()
            r = r.filter(p =>
                p.nombre.toLowerCase().includes(q) ||
                (p.sku ?? '').toLowerCase().includes(q)
            )
        }
        return r
    }, [productos, filtro, busqueda])

    function formatPrecio(v: number | null) {
        if (v == null) return '—'
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
    }

    function confirmarEliminar() {
        if (!eliminarId) return
        router.delete(route('admin.productos.destroy', eliminarId), {
            preserveScroll: true,
            onSuccess: () => { toast.success('Producto eliminado'); setEliminarId(null) },
            onError:   () => { toast.error('Error al eliminar el producto'); setEliminarId(null) },
        })
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Panel', href: route('admin.dashboard') },
                { label: 'Productos' },
            ]}
        >
            <Head title="Productos" />

            {/* Cabecera */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Productos</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Gestiona el catálogo de productos de tu tienda.</p>
                </div>
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

            {productos.length === 0 ? (

                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white py-24 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-slate-100">
                        <PackageOpen className="size-5 text-slate-400" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-900">Sin productos aún</p>
                    <p className="mt-1 text-sm text-slate-400">Crea tu primer producto para empezar.</p>
                    {puede('productos.crear') && (
                        <Button size="sm" className="mt-5" onClick={() => router.visit(route('admin.productos.create'))}>
                            <Plus className="size-4" /> Crear producto
                        </Button>
                    )}
                </div>

            ) : (

                <div className="rounded-lg border border-slate-200 bg-white">

                    {/* Filtros */}
                    <div className="border-b border-slate-100 px-4 py-3 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o SKU…"
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            {FILTROS.map(f => (
                                <button
                                    key={f.key}
                                    type="button"
                                    onClick={() => setFiltro(f.key)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                                        filtro === f.key
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-4 py-3 w-12" />
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Producto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Precio base</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Vendidos</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Hooks</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Temperatura</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Tendencia</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {lista.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">
                                        Sin resultados para "{busqueda}"
                                    </td>
                                </tr>
                            ) : lista.map(p => (
                                <tr
                                    key={p.id}
                                    onClick={() => puede('productos.editar') && router.visit(route('admin.productos.edit', p.id))}
                                    className="group transition-colors duration-150 hover:bg-slate-50 cursor-pointer"
                                >
                                    {/* Imagen */}
                                    <td className="px-4 py-3">
                                        <div className="size-10 rounded-md border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                                            {p.imagen
                                                ? <img src={p.imagen} alt={p.nombre} className="size-full object-cover" />
                                                : <div className="size-full flex items-center justify-center"><PackageOpen className="size-4 text-slate-300" /></div>
                                            }
                                        </div>
                                    </td>

                                    {/* Nombre + SKU */}
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900 leading-tight">{p.nombre}</p>
                                        {p.sku && <p className="text-xs text-slate-400 mt-0.5">SKU: {p.sku}</p>}
                                        {p.categoria && <p className="text-xs text-slate-400 mt-0.5">{p.categoria}</p>}
                                    </td>

                                    {/* Estado */}
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                            p.status === 'activo'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {p.status === 'activo' ? 'Activo' : 'Borrador'}
                                        </span>
                                    </td>

                                    {/* Precio */}
                                    <td className="px-4 py-3 font-medium text-slate-700">
                                        {formatPrecio(p.precio_base)}
                                    </td>

                                    {/* Vendidos */}
                                    <td className="px-4 py-3">
                                        {p.vendidos > 0 ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                                                <ShoppingBag className="size-3 text-slate-400" />
                                                {p.vendidos}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-300">—</span>
                                        )}
                                    </td>

                                    {/* Hooks */}
                                    <td className="px-4 py-3">
                                        {p.hooks_activos > 0 ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                                                <Zap className="size-3" />
                                                {p.hooks_activos}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-300">—</span>
                                        )}
                                    </td>

                                    {/* Temperatura */}
                                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                        <Temperatura
                                            score={p.temperatura}
                                            ventas7d={p.ventas_7d}
                                            vistas7d={p.vistas_7d}
                                            scroll={p.scroll_promedio}
                                        />
                                    </td>

                                    {/* Tendencia */}
                                    <td className="px-4 py-3">
                                        <TendenciaBadge tendencia={p.tendencia} />
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <TooltipProvider delayDuration={200}>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            onClick={() => window.open(route('producto.savia'), '_blank')}
                                                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-200"
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
                                                                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
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
                                                                onClick={() => setEliminarId(p.id)}
                                                                className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {puede('productos.eliminar') ? 'Eliminar' : 'No tienes permiso para eliminar'}
                                                    </TooltipContent>
                                                </Tooltip>

                                            </TooltipProvider>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>

                    <div className="border-t border-slate-100 px-4 py-2.5">
                        <p className="text-xs text-slate-400">{lista.length} de {productos.length} productos</p>
                    </div>
                </div>
            )}

            {/* AlertDialog eliminar */}
            <AlertDialog open={!!eliminarId} onOpenChange={open => { if (!open) setEliminarId(null) }}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
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
