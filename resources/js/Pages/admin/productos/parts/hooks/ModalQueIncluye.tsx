import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import IconPicker from '@/Components/ui/IconPicker'

interface Item { icono: string; texto: string }

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

const MAX = 8

export default function ModalQueIncluye({ open, onClose, productoId, config }: Props) {
    const [titulo,    setTitulo]    = useState<string>((config?.titulo as string) ?? '')
    const [items,     setItems]     = useState<Item[]>((config?.items  as Item[]) ?? [])
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo((config?.titulo as string) ?? '')
        setItems((config?.items  as Item[]) ?? [])
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    function agregar() {
        if (items.length >= MAX) return
        setItems(prev => [...prev, { icono: 'check', texto: '' }])
    }

    function actualizar(i: number, campo: keyof Item, valor: string) {
        setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [campo]: valor } : it))
    }

    function guardar() {
        const validos = items.filter(it => it.texto.trim())
        setGuardando(true)
        router.post(
            route('admin.productos.hooks.config', { producto: productoId, hook: 'que_incluye' }),
            { config: { titulo: titulo.trim() || null, items: validos } } as any,
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
                    <SheetTitle>Qué incluye</SheetTitle>
                    <SheetDescription>Lista de ítems incluidos con el producto (máx. {MAX}).</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

                    {/* Título personalizable */}
                    <div className="space-y-1.5">
                        <Label htmlFor="titulo-kit">Título <span className="font-normal text-slate-400">(opcional)</span></Label>
                        <Input
                            id="titulo-kit"
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            placeholder="Kit completo incluye"
                            maxLength={60}
                        />
                        <p className="text-xs text-slate-400">Por defecto: "Kit completo incluye"</p>
                    </div>

                    <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <IconPicker
                                value={item.icono}
                                onChange={v => actualizar(i, 'icono', v)}
                            />
                            <input
                                type="text"
                                placeholder={`Ítem ${i + 1}`}
                                value={item.texto}
                                onChange={e => actualizar(i, 'texto', e.target.value)}
                                className="flex-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
                                className="text-slate-300 hover:text-red-500 transition-colors duration-200"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </div>
                    ))}

                    {items.length < MAX && (
                        <button
                            type="button"
                            onClick={agregar}
                            className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-sm text-slate-500 transition-colors duration-200 hover:border-slate-400 hover:text-slate-700"
                        >
                            <Plus className="size-4" /> Agregar ítem
                        </button>
                    )}
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || items.length === 0}>
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
