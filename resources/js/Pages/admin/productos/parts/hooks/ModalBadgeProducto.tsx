import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

export default function ModalBadgeProducto({ open, onClose, productoId, config }: Props) {
    const [texto,     setTexto]     = useState((config?.texto as string) ?? '')
    const [color,     setColor]     = useState((config?.color as string) ?? '#10b981')
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        if (!open) return
        setTexto((config?.texto as string) ?? '')
        setColor((config?.color as string) ?? '#10b981')
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    function guardar() {
        setGuardando(true)
        router.post(
            route('admin.productos.hooks.config', { producto: productoId, hook: 'badge_producto' }),
            { config: { texto, color } } as any,
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
                    <SheetTitle>Badge de producto</SheetTitle>
                    <SheetDescription>Etiqueta flotante sobre la imagen en la tarjeta del producto.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Texto del badge</label>
                        <input
                            type="text"
                            value={texto}
                            onChange={e => setTexto(e.target.value)}
                            placeholder="Ej. Nuevo, Oferta, Más vendido"
                            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-2">Color de fondo</label>
                        <div className="flex items-center gap-3">
                            <div className="relative size-9 rounded-md border border-slate-200 overflow-hidden">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={e => setColor(e.target.value)}
                                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                                />
                                <div className="size-full rounded-md" style={{ backgroundColor: color }} />
                            </div>
                            <input
                                type="text"
                                value={color}
                                onChange={e => setColor(e.target.value)}
                                className="flex-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-mono text-slate-900 focus:border-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    {texto && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-medium text-slate-500 mb-3">Vista previa</p>
                            <div className="inline-flex">
                                <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: color }}>
                                    {texto}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <SheetFooter>
                    <button
                        type="button"
                        onClick={guardar}
                        disabled={guardando || !texto.trim()}
                        className="h-9 rounded-md bg-slate-900 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-slate-700 disabled:opacity-50"
                    >
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button type="button" onClick={onClose}
                        className="h-9 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100">
                        Cancelar
                    </button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
