import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { Plus, Trash2, StarIcon, ImageIcon, User } from 'lucide-react'
import { HOOK_LIMITS, postHookConfig } from '@/lib/hooks'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'

interface Resena {
    nombre:     string
    ciudad:     string
    estrellas:  number
    comentario: string
    foto_url?:  string
    foto_ruta?: string
}

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

const MAX = HOOK_LIMITS.RESENAS

export default function ModalResenasClientes({ open, onClose, productoId, config }: Props) {
    const [titulo,    setTitulo]    = useState((config?.titulo as string) ?? '')
    const [resenas,   setResenas]   = useState<Resena[]>((config?.resenas as Resena[]) ?? [])
    const [guardando, setGuardando] = useState(false)
    const [subiendoIdx, setSubiendoIdx] = useState<number | null>(null)
    const fileInputs = useRef<(HTMLInputElement | null)[]>([])

    async function subirFoto(i: number, file: File) {
        setSubiendoIdx(i)
        try {
            const form = new FormData()
            form.append('imagen', file)
            const res = await axios.post<{ url: string; ruta: string }>(
                route('admin.productos.hooks.imagenes.store', { producto: productoId, hook: 'resenas_clientes' }),
                form,
            )
            setResenas(prev => prev.map((r, idx) => idx === i ? { ...r, foto_url: res.data.url, foto_ruta: res.data.ruta } : r))
        } catch {
            toast.error('Error al subir la foto')
        } finally {
            setSubiendoIdx(null)
        }
    }

    async function quitarFoto(i: number) {
        const ruta = resenas[i]?.foto_ruta
        setResenas(prev => prev.map((r, idx) => idx === i ? { ...r, foto_url: undefined, foto_ruta: undefined } : r))
        if (!ruta) return
        try {
            await axios.delete(
                route('admin.productos.hooks.imagenes.destroy', { producto: productoId, hook: 'resenas_clientes' }),
                { data: { ruta } },
            )
        } catch {
            // Silencioso: si falla el delete, el cron de huérfanas lo limpia
        }
    }

    useEffect(() => {
        if (!open) return
        setTitulo((config?.titulo as string) ?? '')
        setResenas((config?.resenas as Resena[]) ?? [])
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    function agregar() {
        if (resenas.length >= MAX) return
        setResenas(prev => [...prev, { nombre: '', ciudad: '', estrellas: 5, comentario: '' }])
    }

    function actualizar(i: number, campo: keyof Resena, v: string | number) {
        setResenas(prev => prev.map((r, idx) => idx === i ? { ...r, [campo]: v } : r))
    }

    function guardar() {
        const validas = resenas.filter(r => r.nombre.trim() && r.comentario.trim())
        setGuardando(true)
        postHookConfig({
            productoId,
            hookKey: 'resenas_clientes',
            config:  { titulo: titulo.trim() || undefined, resenas: validas },
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <Sheet open={open} onOpenChange={handleOpen}>
            <SheetContent className="sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle>Reseñas de clientes</SheetTitle>
                    <SheetDescription>Reseñas manuales con nombre, estrellas y comentario (máx. {MAX}).</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label>Título <span className="text-slate-500">(opcional)</span></Label>
                        <Input
                            placeholder="Reseñas de clientes"
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                        />
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                        {resenas.map((r, i) => (
                            <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">Reseña {i + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => setResenas(prev => prev.filter((_, idx) => idx !== i))}
                                        className="text-slate-300 hover:text-red-500 transition-colors duration-200"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                                <div className="flex gap-2 items-start">
                                    <div className="relative shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => { if (subiendoIdx === null) fileInputs.current[i]?.click() }}
                                            disabled={subiendoIdx !== null}
                                            className="size-10 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden hover:border-slate-400 transition-colors disabled:opacity-60"
                                            title={r.foto_url ? 'Cambiar foto' : 'Subir foto'}
                                        >
                                            {subiendoIdx === i ? (
                                                <div className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                                            ) : r.foto_url ? (
                                                <img src={r.foto_url} alt="" className="size-full object-cover" />
                                            ) : (
                                                <ImageIcon className="size-4 text-slate-400" />
                                            )}
                                        </button>
                                        {r.foto_url && (
                                            <button
                                                type="button"
                                                onClick={() => quitarFoto(i)}
                                                className="absolute -top-1 -right-1 size-4 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 flex items-center justify-center"
                                                title="Quitar foto"
                                            >
                                                <Trash2 className="size-2.5" />
                                            </button>
                                        )}
                                        <input
                                            ref={el => { fileInputs.current[i] = el }}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            className="hidden"
                                            onChange={e => {
                                                const f = e.target.files?.[0]
                                                if (f) subirFoto(i, f)
                                                e.target.value = ''
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <Input placeholder="Nombre" value={r.nombre} onChange={e => actualizar(i, 'nombre', e.target.value)} />
                                        <Input placeholder="Ciudad" value={r.ciudad} onChange={e => actualizar(i, 'ciudad', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(s => (
                                        <button key={s} type="button" onClick={() => actualizar(i, 'estrellas', s)}>
                                            <StarIcon className={`size-4 transition-colors ${s <= r.estrellas ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                                        </button>
                                    ))}
                                </div>
                                <Textarea rows={2} placeholder="Comentario…" value={r.comentario} onChange={e => actualizar(i, 'comentario', e.target.value)} />
                            </div>
                        ))}

                        {resenas.length < MAX && (
                            <button
                                type="button"
                                onClick={agregar}
                                className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-sm text-slate-500 transition-colors duration-200 hover:border-slate-400 hover:text-slate-700"
                            >
                                <Plus className="size-4" /> Agregar reseña
                            </button>
                        )}
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || resenas.length === 0}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
