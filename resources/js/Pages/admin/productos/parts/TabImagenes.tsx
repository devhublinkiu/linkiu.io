import { useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { ImageIcon, Star, Trash2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import type { ProductoData, ImagenData } from '../edit'

interface Props {
    producto?: ProductoData
}

const MAX_IMAGENES = 10

export default function TabImagenes({ producto }: Props) {
    if (!producto) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-slate-500">Primero guarda la información del producto para poder subir imágenes.</p>
            </div>
        )
    }

    const [subiendo, setSubiendo]           = useState(false)
    const [drag, setDrag]                   = useState(false)
    const [eliminarTarget, setEliminarTarget] = useState<ImagenData | null>(null)
    const inputRef                           = useRef<HTMLInputElement>(null)

    const imagenes       = producto.imagenes
    const puedeSubirMas  = imagenes.length < MAX_IMAGENES

    const subirArchivos = (archivos: File[]) => {
        const disponibles = MAX_IMAGENES - imagenes.length
        const cola        = archivos.slice(0, disponibles)
        if (!cola.length) return
        procesarCola(cola)
    }

    const procesarCola = (cola: File[]) => {
        if (!cola.length) { setSubiendo(false); return }
        const [primero, ...resto] = cola

        setSubiendo(true)
        const form = new FormData()
        form.append('imagen', primero)

        router.post(route('admin.productos.imagenes.store', producto.id), form, {
            forceFormData:  true,
            preserveScroll: true,
            onSuccess: () => procesarCola(resto),
            onError:   (errors) => {
                toast.error(String(Object.values(errors)[0]))
                procesarCola(resto)
            },
        })
    }

    const eliminar = (imagen: ImagenData) => {
        router.delete(
            route('admin.productos.imagenes.destroy', { producto: producto.id, imagen: imagen.id }),
            {
                preserveScroll: true,
                onError: () => toast.error('Error al eliminar la imagen'),
            },
        )
        setEliminarTarget(null)
    }

    const marcarPrincipal = (imagen: ImagenData) => {
        router.post(
            route('admin.productos.imagenes.principal', { producto: producto.id, imagen: imagen.id }),
            {},
            {
                preserveScroll: true,
                onError: () => toast.error('Error al marcar la imagen como principal'),
            },
        )
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDrag(false)
        subirArchivos(Array.from(e.dataTransfer.files))
    }

    const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        subirArchivos(Array.from(e.target.files ?? []))
        e.target.value = ''
    }

    return (
        <TooltipProvider delayDuration={300}>
            <div className="space-y-5">

                {/* Zona de carga */}
                {puedeSubirMas && (
                    <div
                        onClick={() => !subiendo && inputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setDrag(true) }}
                        onDragLeave={() => setDrag(false)}
                        onDrop={onDrop}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                            imagenes.length === 0 ? 'h-44' : 'h-24'
                        } ${
                            drag
                                ? 'border-slate-400 bg-slate-50'
                                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                        } ${subiendo ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                        {subiendo ? (
                            <div className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                        ) : (
                            <ImageIcon className="size-5 text-slate-300" />
                        )}
                        <p className="text-sm text-slate-400">
                            {subiendo
                                ? 'Subiendo...'
                                : drag
                                ? 'Suelta las imágenes aquí'
                                : 'Arrastra o haz clic para subir imágenes'}
                        </p>
                        <p className="text-xs text-slate-300">
                            JPEG, PNG, WebP, GIF, BMP · Máx. 10 MB · {imagenes.length}/{MAX_IMAGENES} imágenes
                        </p>
                    </div>
                )}

                {/* Grid de imágenes */}
                {imagenes.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                        {imagenes.map(img => (
                            <Thumbnail
                                key={img.id}
                                imagen={img}
                                onEliminar={() => setEliminarTarget(img)}
                                onPrincipal={() => marcarPrincipal(img)}
                            />
                        ))}
                    </div>
                )}

                {/* Aviso límite alcanzado */}
                {!puedeSubirMas && (
                    <p className="text-xs text-slate-400">
                        Límite de {MAX_IMAGENES} imágenes alcanzado. Elimina alguna para poder subir más.
                    </p>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp"
                    multiple
                    className="hidden"
                    onChange={onChangeInput}
                />

            </div>

            <AlertDialog open={!!eliminarTarget} onOpenChange={open => { if (!open) setEliminarTarget(null) }}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción es irreversible. La imagen se eliminará del producto.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => eliminarTarget && eliminar(eliminarTarget)}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </TooltipProvider>
    )
}

interface ThumbnailProps {
    imagen:      ImagenData
    onEliminar:  () => void
    onPrincipal: () => void
}

function Thumbnail({ imagen, onEliminar, onPrincipal }: ThumbnailProps) {
    return (
        <div className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
            <img src={imagen.url} alt="" className="size-full object-cover" />

            {/* Badge principal */}
            {imagen.principal && (
                <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-amber-400 px-1.5 py-0.5">
                    <Star className="size-2.5 fill-white text-white" />
                    <span className="text-xs font-medium leading-none text-white">Principal</span>
                </div>
            )}

            {/* Overlay en hover */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {!imagen.principal && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={onPrincipal}
                                className="rounded-full bg-white/90 p-1.5 text-slate-700 transition-colors duration-200 hover:bg-amber-400 hover:text-white"
                            >
                                <Star className="size-3.5" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Hacer principal</TooltipContent>
                    </Tooltip>
                )}

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={onEliminar}
                            className="rounded-full bg-white/90 p-1.5 text-slate-700 transition-colors duration-200 hover:bg-red-500 hover:text-white"
                        >
                            <Trash2 className="size-3.5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Eliminar</TooltipContent>
                </Tooltip>
            </div>
        </div>
    )
}
