import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { ImageIcon, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/AlertDialog'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'

export interface HistoriaConfig {
    historia_titulo: string | null
    historia:        string | null
    imagen_url:      string | null
    imagen_ruta:     string | null
}

interface Props {
    open:     boolean
    onClose:  () => void
    config:   HistoriaConfig | null
    disabled: boolean
}

export default function ModalHistoria({ open, onClose, config, disabled }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)

    const [titulo,              setTitulo]              = useState('')
    const [historia,            setHistoria]            = useState('')
    const [imagenUrl,           setImagenUrl]           = useState<string | null>(null)
    const [imagenRuta,          setImagenRuta]          = useState<string | null>(null)
    const [subiendo,            setSubiendo]            = useState(false)
    const [guardando,           setGuardando]           = useState(false)
    const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo(config?.historia_titulo ?? '')
        setHistoria(config?.historia      ?? '')
        setImagenUrl(config?.imagen_url   ?? null)
        setImagenRuta(config?.imagen_ruta ?? null)
    }, [open])

    async function subirArchivo(file: File) {
        setSubiendo(true)
        try {
            const fd = new FormData()
            fd.append('imagen', file)
            const res = await axios.post<{ url: string; ruta: string }>(
                route('admin.build.quienes-somos.historia.imagen.store'), fd
            )
            setImagenUrl(res.data.url)
            setImagenRuta(res.data.ruta)
        } catch {
            toast.error('Error al subir la imagen')
        } finally {
            setSubiendo(false)
        }
    }

    async function eliminarImagen() {
        if (!imagenRuta) return
        const ruta = imagenRuta
        setImagenUrl(null)
        setImagenRuta(null)
        await axios.delete(route('admin.build.quienes-somos.historia.imagen.destroy'), { data: { ruta } })
            .catch(() => toast.error('Error al eliminar la imagen'))
    }

    function guardar() {
        setGuardando(true)
        router.post(route('admin.build.quienes-somos.historia.config'), {
            historia_titulo: titulo   || null,
            historia:        historia || null,
            imagen_url:      imagenUrl  ?? null,
            imagen_ruta:     imagenRuta ?? null,
        }, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <>
            <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
                <SheetContent className="sm:max-w-lg flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Historia</SheetTitle>
                        <SheetDescription>Imagen, título y texto de la historia de la marca.</SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                        <div className="space-y-1.5">
                            <Label htmlFor="hist-titulo">Título</Label>
                            <Input
                                id="hist-titulo"
                                value={titulo}
                                maxLength={120}
                                disabled={disabled}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Una marca nacida desde la necesidad real"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="hist-texto">Historia</Label>
                            <Textarea
                                id="hist-texto"
                                value={historia}
                                maxLength={2000}
                                disabled={disabled}
                                onChange={e => setHistoria(e.target.value)}
                                placeholder="Escribe aquí la historia de la marca… Puedes usar párrafos separados con una línea en blanco."
                                rows={8}
                            />
                        </div>

                        <div className="border-t border-slate-100" />

                        {/* Imagen */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-700">Imagen</p>

                            {imagenUrl ? (
                                <div className="group relative aspect-video rounded-lg border border-slate-200 overflow-hidden">
                                    <img src={imagenUrl} alt="" className="size-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => setConfirmandoEliminar(true)}
                                            className="rounded-full bg-white/90 p-2 text-slate-700 hover:bg-red-500 hover:text-white transition-colors duration-200 ease-in-out"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    disabled={subiendo || disabled}
                                    onClick={() => !subiendo && inputRef.current?.click()}
                                    className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition-colors duration-200 ease-in-out hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {subiendo
                                        ? <div className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                                        : <ImageIcon className="size-5" />
                                    }
                                    <span className="text-sm">{subiendo ? 'Subiendo…' : 'Agregar imagen'}</span>
                                </button>
                            )}

                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                className="hidden"
                                onChange={e => { const f = e.target.files?.[0]; if (f) subirArchivo(f); e.target.value = '' }}
                            />
                        </div>

                    </div>

                    <SheetFooter>
                        <Button onClick={guardar} disabled={guardando || disabled}>
                            {guardando ? 'Guardando…' : 'Guardar'}
                        </Button>
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <AlertDialog open={confirmandoEliminar} onOpenChange={v => { if (!v) setConfirmandoEliminar(false) }}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar imagen</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => { setConfirmandoEliminar(false); eliminarImagen() }}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
