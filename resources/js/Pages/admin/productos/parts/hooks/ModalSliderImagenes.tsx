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

const MAX = 8

export default function ModalSliderImagenes({ open, onClose, productoId, config }: Props) {
    const [imagenes,  setImagenes]  = useState<ImagenItem[]>((config?.imagenes as ImagenItem[]) ?? [])
    const [subiendo,  setSubiendo]  = useState(false)
    const [guardando, setGuardando] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!open) return
        setImagenes((config?.imagenes as ImagenItem[]) ?? [])
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    async function subirArchivo(file: File) {
        if (imagenes.length >= MAX) return
        setSubiendo(true)
        try {
            const form = new FormData()
            form.append('imagen', file)
            const res = await axios.post<ImagenItem>(
                route('admin.productos.hooks.imagenes.store', { producto: productoId, hook: 'slider_imagenes' }),
                form,
            )
            setImagenes(prev => [...prev, res.data])
        } catch {
            toast.error('Error al subir la imagen')
        } finally {
            setSubiendo(false)
        }
    }

    async function eliminar(item: ImagenItem) {
        setImagenes(prev => prev.filter(i => i.ruta !== item.ruta))
        await axios.delete(
            route('admin.productos.hooks.imagenes.destroy', { producto: productoId, hook: 'slider_imagenes' }),
            { data: { ruta: item.ruta } },
        ).catch(() => { toast.error('Error al eliminar la imagen') })
    }

    function onChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) subirArchivo(file)
        e.target.value = ''
    }

    function guardar() {
        setGuardando(true)
        router.post(
            route('admin.productos.hooks.config', { producto: productoId, hook: 'slider_imagenes' }),
            { config: { imagenes } } as any,
            {
                preserveScroll: true,
                onSuccess: () => { toast.success('Hook guardado'); onClose() },
                onError:   () => toast.error('Error al guardar'),
                onFinish:  () => setGuardando(false),
            },
        )
    }

    return (
        <Sheet open={open} onOpenChange={handleOpen}>
            <SheetContent className="sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>Slider de imágenes</SheetTitle>
                    <SheetDescription>Galería en carrusel (máx. {MAX} imágenes).</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

                    {/* Grid de imágenes */}
                    {imagenes.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {imagenes.map((img, i) => (
                                <div key={i} className="group relative aspect-square rounded-lg border border-slate-200 overflow-hidden">
                                    <img src={img.url} alt="" className="size-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            type="button"
                                            onClick={() => eliminar(img)}
                                            className="rounded-full bg-white/90 p-1.5 text-slate-700 hover:bg-red-500 hover:text-white transition-colors duration-200"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Zona de carga */}
                    {imagenes.length < MAX && (
                        <button
                            type="button"
                            disabled={subiendo}
                            onClick={() => !subiendo && inputRef.current?.click()}
                            className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {subiendo
                                ? <div className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                                : <ImageIcon className="size-5" />
                            }
                            <span className="text-sm">{subiendo ? 'Subiendo…' : 'Agregar imagen'}</span>
                            <span className="text-xs text-slate-300">{imagenes.length}/{MAX}</span>
                        </button>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={onChangeInput}
                    />
                </div>

                <SheetFooter>
                    <button
                        type="button"
                        onClick={guardar}
                        disabled={guardando || imagenes.length === 0}
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
