import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { postHookConfig } from '@/lib/hooks'

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

    // Dep array intencionalmente solo `[open]` — sincronizamos el form
    // con `config` SOLO al abrir el modal. Agregar `config` a las deps
    // resetearía los campos si el padre re-renderiza (ej. Inertia replace
    // tras un save de otro hook) mientras el usuario está editando, lo
    // cual borraría su input no guardado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        postHookConfig({
            productoId,
            hookKey: 'badge_producto',
            config:  { texto, color },
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
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
                        <Input
                            type="text"
                            value={texto}
                            onChange={e => setTexto(e.target.value)}
                            placeholder="Ej. Nuevo, Oferta, Más vendido"
                            className="h-9"
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
                            <Input
                                type="text"
                                value={color}
                                onChange={e => setColor(e.target.value)}
                                className="flex-1 h-9 font-mono"
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
                    <Button onClick={guardar} disabled={guardando || !texto.trim()}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
