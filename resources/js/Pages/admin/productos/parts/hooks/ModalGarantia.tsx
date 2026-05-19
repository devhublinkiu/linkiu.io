import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'
import IconPicker from '@/Components/ui/IconPicker'

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

export default function ModalGarantia({ open, onClose, productoId, config }: Props) {
    const [titulo,      setTitulo]      = useState((config?.titulo      as string) ?? '')
    const [descripcion, setDescripcion] = useState((config?.descripcion as string) ?? '')
    const [icono,       setIcono]       = useState((config?.icono       as string) ?? 'shield-check')
    const [guardando,   setGuardando]   = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo((config?.titulo      as string) ?? '')
        setDescripcion((config?.descripcion as string) ?? '')
        setIcono((config?.icono        as string) ?? 'shield-check')
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    function guardar() {
        setGuardando(true)
        router.post(
            route('admin.productos.hooks.config', { producto: productoId, hook: 'garantia' }),
            { config: { titulo, descripcion, icono } } as any,
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
                    <SheetTitle>Garantía</SheetTitle>
                    <SheetDescription>Bloque de garantía con título, descripción y CTA.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label>Ícono</Label>
                        <IconPicker value={icono} onChange={setIcono} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Título</Label>
                        <Textarea
                            rows={2}
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                            placeholder={"Garantía de 15 días.\nO te devolvemos tu dinero."}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Descripción</Label>
                        <Textarea
                            rows={3}
                            value={descripcion}
                            onChange={e => setDescripcion(e.target.value)}
                            placeholder="Si no quedas satisfecho, contáctanos en los primeros 15 días…"
                        />
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || !titulo.trim()}>
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
