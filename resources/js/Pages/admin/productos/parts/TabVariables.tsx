import { useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, Trash2, ChevronDown, ChevronUp, Palette, ImageIcon, Type, Pencil, Check, X } from 'lucide-react'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import { Switch } from '@/Components/ui/Switch'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import { formatearPrecio } from '@/lib/utils'
import type { ProductoData, VariableGrupoData, VariableItemData } from '../Edit'

interface Props {
    producto: ProductoData
}

const TIPO_CONFIG = {
    color:  { label: 'Color',  icon: Palette,   color: 'bg-violet-50 text-violet-700 border-violet-200' },
    imagen: { label: 'Imagen', icon: ImageIcon,  color: 'bg-sky-50 text-sky-700 border-sky-200'          },
    texto:  { label: 'Texto',  icon: Type,       color: 'bg-slate-100 text-slate-600 border-slate-200'   },
}

export default function TabVariables({ producto }: Props) {
    const [creandoGrupo, setCreandoGrupo] = useState(false)
    const [nuevoNombre,  setNuevoNombre]  = useState('')
    const [nuevoTipo,    setNuevoTipo]    = useState<'color' | 'imagen' | 'texto'>('texto')
    const [guardando,    setGuardando]    = useState(false)

    const crearGrupo = () => {
        if (!nuevoNombre.trim()) return
        setGuardando(true)
        router.post(
            route('admin.productos.variables.grupos.store', producto.id),
            { nombre: nuevoNombre.trim(), tipo: nuevoTipo },
            {
                preserveScroll: true,
                onSuccess: () => { setCreandoGrupo(false); setNuevoNombre(''); setNuevoTipo('texto') },
                onError:   (e) => toast.error(String(Object.values(e)[0])),
                onFinish:  () => setGuardando(false),
            },
        )
    }

    return (
        <TooltipProvider delayDuration={300}>
            <div className="space-y-4">

                {producto.grupos.length === 0 && !creandoGrupo && (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <p className="text-sm text-slate-400">Sin grupos de variables. Agrega uno para empezar.</p>
                    </div>
                )}

                {producto.grupos.map(grupo => (
                    <GrupoCard key={grupo.id} grupo={grupo} producto={producto} />
                ))}

                {creandoGrupo ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-3 text-sm font-medium text-slate-700">Nuevo grupo de variables</p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Input
                                autoFocus
                                type="text"
                                placeholder="Nombre del grupo (ej. Color, Talla)"
                                value={nuevoNombre}
                                onChange={e => setNuevoNombre(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && crearGrupo()}
                                className="flex-1"
                            />
                            <div className="flex gap-2">
                                {(['texto', 'color', 'imagen'] as const).map(t => {
                                    const cfg  = TIPO_CONFIG[t]
                                    const Icon = cfg.icon
                                    return (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setNuevoTipo(t)}
                                            className={`flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors duration-200 ${
                                                nuevoTipo === t ? cfg.color : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            <Icon className="size-3.5" />
                                            {cfg.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                onClick={crearGrupo}
                                disabled={guardando || !nuevoNombre.trim()}
                            >
                                {guardando ? 'Creando...' : 'Crear grupo'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => { setCreandoGrupo(false); setNuevoNombre('') }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-dashed"
                        onClick={() => setCreandoGrupo(true)}
                    >
                        <Plus className="size-4" />
                        Agregar grupo
                    </Button>
                )}

            </div>
        </TooltipProvider>
    )
}

// ─── GrupoCard ────────────────────────────────────────────────────────────────

interface GrupoCardProps {
    grupo:    VariableGrupoData
    producto: ProductoData
}

function GrupoCard({ grupo, producto }: GrupoCardProps) {
    const [editandoNombre,   setEditandoNombre]   = useState(false)
    const [nombre,           setNombre]           = useState(grupo.nombre)
    const [abierto,          setAbierto]          = useState(true)
    const [confirmarEliminar, setConfirmarEliminar] = useState(false)

    const cfg  = TIPO_CONFIG[grupo.tipo]
    const Icon = cfg.icon

    const guardarNombre = () => {
        if (!nombre.trim() || nombre.trim() === grupo.nombre) { setEditandoNombre(false); return }
        router.post(
            route('admin.productos.variables.grupos.update', { producto: producto.id, grupo: grupo.id }),
            { nombre: nombre.trim() },
            {
                preserveScroll: true,
                onSuccess: () => setEditandoNombre(false),
                onError:   () => toast.error('Error al renombrar el grupo'),
            },
        )
    }

    const eliminarGrupo = () => {
        router.delete(
            route('admin.productos.variables.grupos.destroy', { producto: producto.id, grupo: grupo.id }),
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Grupo eliminado'),
                onError:   () => toast.error('Error al eliminar el grupo'),
            },
        )
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center gap-3 px-4 py-3">
                <button
                    type="button"
                    onClick={() => setAbierto(v => !v)}
                    className="text-slate-400 hover:text-slate-600"
                >
                    {abierto ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {editandoNombre ? (
                    <div className="flex flex-1 items-center gap-2">
                        <Input
                            autoFocus
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter')  guardarNombre()
                                if (e.key === 'Escape') { setEditandoNombre(false); setNombre(grupo.nombre) }
                            }}
                            className="h-7 flex-1"
                        />
                        <button type="button" onClick={guardarNombre} className="text-emerald-600 hover:text-emerald-700">
                            <Check className="size-4" />
                        </button>
                        <button type="button" onClick={() => { setEditandoNombre(false); setNombre(grupo.nombre) }} className="text-slate-400 hover:text-slate-600">
                            <X className="size-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-1 items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{grupo.nombre}</span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button type="button" onClick={() => setEditandoNombre(true)} className="text-slate-300 hover:text-slate-500">
                                    <Pencil className="size-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Renombrar</TooltipContent>
                        </Tooltip>
                    </div>
                )}

                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                    <Icon className="size-3" />
                    {cfg.label}
                </span>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() => setConfirmarEliminar(true)}
                            className="text-slate-300 transition-colors duration-200 hover:text-red-500"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Eliminar grupo</TooltipContent>
                </Tooltip>
            </div>

            {abierto && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                    <ItemsTable grupo={grupo} producto={producto} />
                </div>
            )}

            <AlertDialog open={confirmarEliminar} onOpenChange={open => !open && setConfirmarEliminar(false)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar grupo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminarán también todos los ítems de <strong>"{grupo.nombre}"</strong>. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={eliminarGrupo}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

// ─── ItemsTable ───────────────────────────────────────────────────────────────

interface ItemsTableProps {
    grupo:    VariableGrupoData
    producto: ProductoData
}

function ItemsTable({ grupo, producto }: ItemsTableProps) {
    const [agregando, setAgregando] = useState(false)

    const gridCols =
        grupo.tipo === 'imagen' ? 'grid-cols-[48px_1fr_120px_48px_32px]' :
        grupo.tipo === 'color'  ? 'grid-cols-[32px_1fr_120px_48px_32px]' :
                                  'grid-cols-[1fr_120px_48px_32px]'

    return (
        <div className="space-y-1">
            {grupo.items.length > 0 && (
                <div className={`grid items-center gap-3 px-2 pb-1 text-xs font-medium text-slate-400 ${gridCols}`}>
                    {grupo.tipo === 'imagen' && <span>Imagen</span>}
                    {grupo.tipo === 'color'  && <span>Color</span>}
                    <span>Nombre</span>
                    <span>Ajuste precio</span>
                    <span className="text-center">Activo</span>
                    <span />
                </div>
            )}

            {grupo.items.map(item => (
                <ItemRow key={item.id} item={item} grupo={grupo} producto={producto} gridCols={gridCols} />
            ))}

            {agregando ? (
                <NuevoItemRow
                    grupo={grupo}
                    producto={producto}
                    onCancel={() => setAgregando(false)}
                    onSaved={() => setAgregando(false)}
                />
            ) : (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAgregando(true)}
                >
                    <Plus className="size-3.5" />
                    Agregar ítem
                </Button>
            )}
        </div>
    )
}

// ─── ItemRow ──────────────────────────────────────────────────────────────────

interface ItemRowProps {
    item:     VariableItemData
    grupo:    VariableGrupoData
    producto: ProductoData
    gridCols: string
}

function ItemRow({ item, grupo, producto, gridCols }: ItemRowProps) {
    const [confirmarEliminar, setConfirmarEliminar] = useState(false)

    const eliminar = () => {
        router.delete(
            route('admin.productos.variables.items.destroy', { producto: producto.id, grupo: grupo.id, item: item.id }),
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Ítem eliminado'),
                onError:   () => toast.error('Error al eliminar el ítem'),
            },
        )
    }

    const toggle = () => router.post(
        route('admin.productos.variables.items.toggle', { producto: producto.id, grupo: grupo.id, item: item.id }),
        {},
        {
            preserveScroll: true,
            onSuccess: () => toast.success(item.activo ? 'Ítem desactivado' : 'Ítem activado'),
            onError:   () => toast.error('Error al cambiar el estado'),
        },
    )

    return (
        <>
            <div className={`grid items-center gap-3 rounded-md px-2 py-1.5 transition-colors duration-200 hover:bg-slate-50 ${gridCols}`}>

                {grupo.tipo === 'imagen' && (
                    <div className="size-10 overflow-hidden rounded border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {item.url
                            ? <img src={item.url} alt="" className="size-full object-cover" />
                            : <ImageIcon className="size-4 text-slate-300" />
                        }
                    </div>
                )}

                {grupo.tipo === 'color' && (
                    <div
                        className="size-6 rounded-full border border-slate-200"
                        style={{ backgroundColor: item.valor ?? '#e2e8f0' }}
                    />
                )}

                <span className="text-sm text-slate-700">{item.nombre}</span>

                <span className="text-sm text-slate-500">
                    {item.precio_ajuste != null
                        ? (item.precio_ajuste >= 0 ? '+' : '') + '$' + formatearPrecio(item.precio_ajuste)
                        : <span className="text-slate-300">—</span>
                    }
                </span>

                <div className="flex justify-center">
                    <Switch checked={item.activo} onCheckedChange={toggle} />
                </div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() => setConfirmarEliminar(true)}
                            className="text-slate-300 transition-colors duration-200 hover:text-red-500"
                        >
                            <Trash2 className="size-3.5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Eliminar</TooltipContent>
                </Tooltip>
            </div>

            <AlertDialog open={confirmarEliminar} onOpenChange={open => !open && setConfirmarEliminar(false)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar ítem?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de eliminar <strong>"{item.nombre}"</strong>. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={eliminar}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

// ─── NuevoItemRow ─────────────────────────────────────────────────────────────

interface NuevoItemRowProps {
    grupo:    VariableGrupoData
    producto: ProductoData
    onCancel: () => void
    onSaved:  () => void
}

function NuevoItemRow({ grupo, producto, onCancel, onSaved }: NuevoItemRowProps) {
    const [nombre,        setNombre]        = useState('')
    const [valor,         setValor]         = useState('#6366f1')
    const [precioInput,   setPrecioInput]   = useState('')
    const [guardando,     setGuardando]     = useState(false)
    const [imagenPreview, setImagenPreview] = useState<string | null>(null)
    const [imagenFile,    setImagenFile]    = useState<File | null>(null)
    const inputImagenRef                    = useRef<HTMLInputElement>(null)

    const onImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImagenFile(file)
        setImagenPreview(URL.createObjectURL(file))
    }

    const guardar = () => {
        if (!nombre.trim()) return
        setGuardando(true)

        const form = new FormData()
        form.append('nombre', nombre.trim())
        if (grupo.tipo === 'color')                  form.append('valor', valor)
        if (grupo.tipo === 'imagen' && imagenFile)   form.append('imagen', imagenFile)
        if (precioInput.replace(/[^-\d]/g, ''))      form.append('precio_ajuste', precioInput.replace(/[^-\d]/g, ''))

        router.post(
            route('admin.productos.variables.items.store', { producto: producto.id, grupo: grupo.id }),
            form,
            {
                forceFormData:  true,
                preserveScroll: true,
                onSuccess: onSaved,
                onError:   (e) => toast.error(String(Object.values(e)[0])),
                onFinish:  () => setGuardando(false),
            },
        )
    }

    return (
        <div className="mt-1 rounded-md border border-dashed border-slate-200 bg-slate-50/50 p-2">
            <div className="flex flex-wrap items-center gap-2">

                {/* Imagen picker */}
                {grupo.tipo === 'imagen' && (
                    <button
                        type="button"
                        onClick={() => inputImagenRef.current?.click()}
                        className="flex size-10 flex-shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-white transition-colors duration-200 hover:border-slate-300"
                    >
                        {imagenPreview
                            ? <img src={imagenPreview} alt="" className="size-full object-cover" />
                            : <ImageIcon className="size-4 text-slate-300" />
                        }
                    </button>
                )}

                {/* Color picker */}
                {grupo.tipo === 'color' && (
                    <div className="relative size-8 flex-shrink-0">
                        <div
                            className="size-full cursor-pointer rounded-full border border-slate-200"
                            style={{ backgroundColor: valor }}
                            onClick={() => document.getElementById(`cp-new-${grupo.id}`)?.click()}
                        />
                        <input
                            id={`cp-new-${grupo.id}`}
                            type="color"
                            value={valor}
                            onChange={e => setValor(e.target.value)}
                            className="absolute inset-0 size-full cursor-pointer opacity-0"
                        />
                    </div>
                )}

                {/* Nombre */}
                <Input
                    autoFocus
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && guardar()}
                    className="h-8 min-w-0 flex-1"
                />

                {/* Ajuste precio */}
                <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="+/- precio"
                    value={precioInput}
                    onChange={e => setPrecioInput(e.target.value.replace(/[^\d-]/g, ''))}
                    className="h-8 w-28"
                />

                <Button
                    type="button"
                    size="sm"
                    onClick={guardar}
                    disabled={guardando || !nombre.trim()}
                >
                    <Check className="size-3.5" />
                    {guardando ? 'Guardando...' : 'Guardar'}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="px-2"
                >
                    <X className="size-3.5" />
                </Button>
            </div>

            <input
                ref={inputImagenRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImagenChange}
            />
        </div>
    )
}
