import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { ImageIcon, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Switch } from '@/Components/ui/Switch'
import { HOOK_LIMITS, postHookConfig } from '@/lib/hooks'

interface ImagenItem { url: string; ruta: string }

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

const MAX = HOOK_LIMITS.RESENAS_IMAGEN

export default function ModalResenasImagen({ open, onClose, productoId, config }: Props) {
    const [imagenes,  setImagenes]  = useState<ImagenItem[]>((config?.imagenes as ImagenItem[]) ?? [])
    const [autoplay,  setAutoplay]  = useState((config?.autoplay  as boolean) ?? false)
    const [intervalo, setIntervalo] = useState((config?.intervalo as number)  ?? 5)
    const [subiendo,  setSubiendo]  = useState(false)
    const [guardando, setGuardando] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!open) return
        setImagenes((config?.imagenes as ImagenItem[]) ?? [])
        setAutoplay((config?.autoplay  as boolean) ?? false)
        setIntervalo((config?.intervalo as number)  ?? 5)
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
                route('admin.productos.hooks.imagenes.store', { producto: productoId, hook: 'resenas_imagen' }),
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
        const snapshot = imagenes
        setImagenes(prev => prev.filter(i => i.ruta !== item.ruta))
        try {
            await axios.delete(
                route('admin.productos.hooks.imagenes.destroy', { producto: productoId, hook: 'resenas_imagen' }),
                { data: { ruta: item.ruta } },
            )
        } catch {
            setImagenes(snapshot)
            toast.error('Error al eliminar la imagen')
        }
    }

    function onChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) subirArchivo(file)
        e.target.value = ''
    }

    function guardar() {
        setGuardando(true)
        postHookConfig({
            productoId,
            hookKey: 'resenas_imagen',
            config:  { imagenes, autoplay, intervalo },
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <Sheet open={open} onOpenChange={handleOpen}>
            <SheetContent className="sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>Reseñas por imagen</SheetTitle>
                    <SheetDescription>Capturas de reseñas en slider con altura adaptable (máx. {MAX}).</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

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

                    {imagenes.length < MAX && (
                        <button
                            type="button"
                            disabled={subiendo}
                            onClick={() => !subiendo && inputRef.current?.click()}
                            className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-500 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
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

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium text-slate-700">Autoplay</p>
                                <p className="text-xs text-slate-500">Cambia de slide automáticamente.</p>
                            </div>
                            <Switch checked={autoplay} onCheckedChange={setAutoplay} />
                        </div>

                        {autoplay && (
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Intervalo: <span className="text-slate-900">{intervalo}s</span>
                                </label>
                                <input
                                    type="range"
                                    min={3}
                                    max={10}
                                    step={1}
                                    value={intervalo}
                                    onChange={e => setIntervalo(parseInt(e.target.value, 10))}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || imagenes.length === 0}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
