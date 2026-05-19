import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { ImageIcon, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'

interface ImagenItem { url: string; ruta: string }

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

export default function ModalComparacionVisual({ open, onClose, productoId, config }: Props) {
    const [titulo,         setTitulo]         = useState<string>((config?.titulo as string) ?? '')
    const [imagenAntes,    setImagenAntes]    = useState<ImagenItem | null>((config?.imagen_antes as ImagenItem) ?? null)
    const [imagenDespues,  setImagenDespues]  = useState<ImagenItem | null>((config?.imagen_despues as ImagenItem) ?? null)
    const [subiendoAntes,  setSubiendoAntes]  = useState(false)
    const [subiendoDespues,setSubiendoDespues]= useState(false)
    const [guardando,      setGuardando]      = useState(false)

    const inputAntesRef    = useRef<HTMLInputElement>(null)
    const inputDespuesRef  = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!open) return
        setTitulo((config?.titulo as string) ?? '')
        setImagenAntes((config?.imagen_antes as ImagenItem) ?? null)
        setImagenDespues((config?.imagen_despues as ImagenItem) ?? null)
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    async function subirImagen(file: File, slot: 'antes' | 'despues') {
        const setSubiendo = slot === 'antes' ? setSubiendoAntes : setSubiendoDespues
        const setImagen   = slot === 'antes' ? setImagenAntes   : setImagenDespues
        setSubiendo(true)
        try {
            const form = new FormData()
            form.append('imagen', file)
            const res = await axios.post<ImagenItem>(
                route('admin.productos.hooks.imagenes.store', { producto: productoId, hook: 'comparacion_visual' }),
                form,
            )
            setImagen(res.data)
        } catch {
            toast.error('Error al subir la imagen')
        } finally {
            setSubiendo(false)
        }
    }

    async function eliminarImagen(slot: 'antes' | 'despues') {
        const imagen  = slot === 'antes' ? imagenAntes : imagenDespues
        const setImg  = slot === 'antes' ? setImagenAntes : setImagenDespues
        if (!imagen) return
        setImg(null)
        await axios.delete(
            route('admin.productos.hooks.imagenes.destroy', { producto: productoId, hook: 'comparacion_visual' }),
            { data: { ruta: imagen.ruta } },
        ).catch(() => { toast.error('Error al eliminar la imagen') })
    }

    function guardar() {
        setGuardando(true)
        router.post(
            route('admin.productos.hooks.config', { producto: productoId, hook: 'comparacion_visual' }),
            { config: { titulo, imagen_antes: imagenAntes, imagen_despues: imagenDespues } } as any,
            {
                preserveScroll: true,
                onSuccess: () => { toast.success('Hook guardado'); onClose() },
                onError:   () => toast.error('Error al guardar'),
                onFinish:  () => setGuardando(false),
            },
        )
    }

    const puedeGuardar = !!imagenAntes && !!imagenDespues

    return (
        <Sheet open={open} onOpenChange={handleOpen}>
            <SheetContent className="sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>Comparación visual</SheetTitle>
                    <SheetDescription>Arrastra para comparar imagen antes y después.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    {/* Título */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Título</label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            placeholder="Antes y después (opcional)"
                            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                        />
                    </div>

                    {/* Slots de imágenes */}
                    <div className="grid grid-cols-2 gap-3">
                        <ImagenSlot
                            label="Antes"
                            imagen={imagenAntes}
                            subiendo={subiendoAntes}
                            inputRef={inputAntesRef}
                            onEliminar={() => eliminarImagen('antes')}
                        />
                        <ImagenSlot
                            label="Después"
                            imagen={imagenDespues}
                            subiendo={subiendoDespues}
                            inputRef={inputDespuesRef}
                            onEliminar={() => eliminarImagen('despues')}
                        />
                    </div>

                    <input ref={inputAntesRef}   type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) subirImagen(f, 'antes');    e.target.value = '' }} />
                    <input ref={inputDespuesRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) subirImagen(f, 'despues'); e.target.value = '' }} />
                </div>

                <SheetFooter>
                    <button
                        type="button"
                        onClick={guardar}
                        disabled={guardando || !puedeGuardar}
                        className="h-9 rounded-md bg-slate-900 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-slate-700 disabled:opacity-50"
                    >
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100"
                    >
                        Cancelar
                    </button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

interface SlotProps {
    label:     string
    imagen:    { url: string } | null
    subiendo:  boolean
    inputRef:  React.RefObject<HTMLInputElement>
    onEliminar: () => void
}

function ImagenSlot({ label, imagen, subiendo, inputRef, onEliminar }: SlotProps) {
    return (
        <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            {imagen ? (
                <div className="group relative aspect-video rounded-lg border border-slate-200 overflow-hidden">
                    <img src={imagen.url} alt={label} className="size-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            type="button"
                            onClick={onEliminar}
                            className="rounded-full bg-white/90 p-1.5 text-slate-700 hover:bg-red-500 hover:text-white transition-colors duration-200"
                        >
                            <Trash2 className="size-3.5" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    disabled={subiendo}
                    onClick={() => !subiendo && inputRef.current?.click()}
                    className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {subiendo
                        ? <div className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                        : <ImageIcon className="size-4" />
                    }
                    <span className="text-xs">{subiendo ? 'Subiendo…' : 'Subir imagen'}</span>
                </button>
            )}
        </div>
    )
}
