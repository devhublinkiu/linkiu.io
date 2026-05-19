import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import IconPicker from '@/Components/ui/IconPicker'

interface Item { icono: string; titulo: string; descripcion: string }

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

const MAX = 4

export default function ModalCaracteristicas({ open, onClose, productoId, config }: Props) {
    const [titulo,      setTitulo]      = useState((config?.titulo      as string) ?? 'Características destacadas')
    const [descripcion, setDescripcion] = useState((config?.descripcion as string) ?? '')
    const [items,     setItems]     = useState<Item[]>((config?.items as Item[]) ?? [])
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo((config?.titulo      as string) ?? 'Características destacadas')
        setDescripcion((config?.descripcion as string) ?? '')
        setItems((config?.items as Item[]) ?? [])
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    function agregar() {
        if (items.length >= MAX) return
        setItems(prev => [...prev, { icono: 'star', titulo: '', descripcion: '' }])
    }

    function actualizar(i: number, campo: keyof Item, v: string) {
        setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [campo]: v } : it))
    }

    function guardar() {
        const validos = items.filter(it => it.titulo.trim())
        setGuardando(true)
        router.post(
            route('admin.productos.hooks.config', { producto: productoId, hook: 'caracteristicas_destacadas' }),
            { config: { titulo, descripcion, items: validos } } as any,
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
                    <SheetTitle>Características destacadas</SheetTitle>
                    <SheetDescription>Cards con emoji, título y descripción (máx. {MAX}).</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Título</label>
                            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Descripción <span className="text-slate-400">(opcional)</span></label>
                            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Opcional"
                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                        {items.map((item, i) => (
                            <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">Característica {i + 1}</span>
                                    <button type="button" onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
                                        className="text-slate-300 hover:text-red-500 transition-colors duration-200">
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <IconPicker value={item.icono} onChange={v => actualizar(i, 'icono', v)} />
                                    <input type="text" placeholder="Título" value={item.titulo} onChange={e => actualizar(i, 'titulo', e.target.value)}
                                        className="flex-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                                    />
                                </div>
                                <textarea rows={2} placeholder="Descripción…" value={item.descripcion} onChange={e => actualizar(i, 'descripcion', e.target.value)}
                                    className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none resize-none"
                                />
                            </div>
                        ))}
                        {items.length < MAX && (
                            <button type="button" onClick={agregar}
                                className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-sm text-slate-500 transition-colors duration-200 hover:border-slate-400 hover:text-slate-700">
                                <Plus className="size-4" /> Agregar característica
                            </button>
                        )}
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || items.length === 0}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
