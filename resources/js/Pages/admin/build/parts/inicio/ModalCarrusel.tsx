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

interface CarruselItem {
    url:  string
    ruta: string
    link: string | null
}

export interface CarruselConfig {
    titulo:      string | null
    descripcion: string | null
    items:       CarruselItem[]
}

interface Props {
    open:     boolean
    onClose:  () => void
    config:   CarruselConfig | null
    disabled: boolean
}

const MAX = 10

export default function ModalCarrusel({ open, onClose, config, disabled }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)

    const [titulo,               setTitulo]               = useState('')
    const [descripcion,          setDescripcion]          = useState('')
    const [items,                setItems]                = useState<CarruselItem[]>([])
    const [subiendo,             setSubiendo]             = useState(false)
    const [guardando,            setGuardando]            = useState(false)
    const [confirmandoEliminar,  setConfirmandoEliminar]  = useState<CarruselItem | null>(null)

    useEffect(() => {
        if (!open) return
        setTitulo(config?.titulo       ?? '')
        setDescripcion(config?.descripcion ?? '')
        setItems(config?.items         ?? [])
    }, [open])

    async function subirArchivo(file: File) {
        if (items.length >= MAX) return
        setSubiendo(true)
        try {
            const fd = new FormData()
            fd.append('imagen', file)
            const res = await axios.post<CarruselItem>(route('admin.build.inicio.carrusel.imagenes.store'), fd)
            setItems(prev => [...prev, { ...res.data, link: null }])
        } catch {
            toast.error('Error al subir la imagen')
        } finally {
            setSubiendo(false)
        }
    }

    async function eliminarItem(item: CarruselItem) {
        setItems(prev => prev.filter(i => i.ruta !== item.ruta))
        await axios.delete(route('admin.build.inicio.carrusel.imagenes.destroy'), { data: { ruta: item.ruta } })
            .catch(() => toast.error('Error al eliminar la imagen'))
    }

    function actualizarLink(ruta: string, link: string) {
        setItems(prev => prev.map(i => i.ruta === ruta ? { ...i, link: link || null } : i))
    }

    function guardar() {
        setGuardando(true)
        router.post(route('admin.build.inicio.carrusel.config'), {
            titulo:      titulo      || null,
            descripcion: descripcion || null,
            items,
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
                    <SheetTitle>Carrusel</SheetTitle>
                    <SheetDescription>Galería de imágenes deslizable (máx. {MAX}).</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    {/* Textos de sección */}
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="car-titulo">Título</Label>
                            <Input
                                id="car-titulo"
                                value={titulo}
                                maxLength={100}
                                disabled={disabled}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Galería"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="car-desc">Descripción</Label>
                            <Textarea
                                id="car-desc"
                                value={descripcion}
                                maxLength={200}
                                disabled={disabled}
                                onChange={e => setDescripcion(e.target.value)}
                                placeholder="Resultados reales de nuestras clientas."
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Imágenes */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">
                                Imágenes{' '}
                                <span className="font-normal text-slate-400">({items.length}/{MAX})</span>
                            </p>
                        </div>

                        {items.map((item, i) => (
                            <div key={item.ruta} className="flex items-center gap-3">
                                <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                    <img src={item.url} alt={`Imagen ${i + 1}`} className="size-full object-cover" />
                                </div>
                                <Input
                                    value={item.link ?? ''}
                                    maxLength={500}
                                    disabled={disabled}
                                    onChange={e => actualizarLink(item.ruta, e.target.value)}
                                    placeholder="Link opcional — https://... o /productos"
                                    className="flex-1"
                                />
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => setConfirmandoEliminar(item)}
                                    className="text-slate-400 hover:text-red-500 transition-colors duration-200 ease-in-out disabled:cursor-not-allowed shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {items.length < MAX && (
                            <button
                                type="button"
                                disabled={subiendo || disabled}
                                onClick={() => !subiendo && inputRef.current?.click()}
                                className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {subiendo
                                    ? <div className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                                    : <ImageIcon className="size-5" />
                                }
                                <span className="text-sm">{subiendo ? 'Subiendo…' : 'Agregar imagen'}</span>
                                <span className="text-xs text-slate-300">{items.length}/{MAX} · Cuadrada recomendado</span>
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
                    <Button onClick={guardar} disabled={guardando || disabled || items.length === 0}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>

        <AlertDialog open={!!confirmandoEliminar} onOpenChange={v => { if (!v) setConfirmandoEliminar(null) }}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar imagen</AlertDialogTitle>
                    <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={() => {
                            const item = confirmandoEliminar!
                            setConfirmandoEliminar(null)
                            eliminarItem(item)
                        }}
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}
