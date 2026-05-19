import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

export default function ModalUrgenciaStock({ open, onClose, productoId, config }: Props) {
    const [stockTotal,    setStockTotal]    = useState(String((config?.stock_total    as number | undefined) ?? 50))
    const [stockRestante, setStockRestante] = useState(String((config?.stock_restante as number | undefined) ?? 12))
    const [duracionHoras, setDuracionHoras] = useState(String((config?.duracion_horas as number | undefined) ?? 8))
    const [guardando,     setGuardando]     = useState(false)

    useEffect(() => {
        if (!open) return
        setStockTotal(String((config?.stock_total    as number | undefined) ?? 50))
        setStockRestante(String((config?.stock_restante as number | undefined) ?? 12))
        setDuracionHoras(String((config?.duracion_horas as number | undefined) ?? 8))
    }, [open])

    function guardar() {
        setGuardando(true)
        router.post(
            route('admin.productos.hooks.config', { producto: productoId, hook: 'urgencia_stock' }),
            {
                config: {
                    stock_total:    parseInt(stockTotal)    || 50,
                    stock_restante: parseInt(stockRestante) || 12,
                    duracion_horas: parseInt(duracionHoras) || 8,
                },
            } as any,
            {
                preserveScroll: true,
                onSuccess: () => { toast.success('Hook guardado'); onClose() },
                onError:   () => toast.error('Error al guardar'),
                onFinish:  () => setGuardando(false),
            },
        )
    }

    return (
        <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
            <SheetContent className="sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>Urgencia de stock</SheetTitle>
                    <SheetDescription>Configura la barra de stock animada con countdown.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    <div className="space-y-1.5">
                        <Label htmlFor="stock-total">Stock total del lote</Label>
                        <Input
                            id="stock-total"
                            type="number"
                            min="1"
                            value={stockTotal}
                            onChange={e => setStockTotal(e.target.value)}
                            placeholder="50"
                        />
                        <p className="text-xs text-slate-400">Capacidad máxima de tu lote actual.</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="stock-restante">Unidades restantes</Label>
                        <Input
                            id="stock-restante"
                            type="number"
                            min="1"
                            value={stockRestante}
                            onChange={e => setStockRestante(e.target.value)}
                            placeholder="12"
                        />
                        <p className="text-xs text-slate-400">Unidades visibles al cargar la página.</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="duracion-horas">Duración del countdown (horas)</Label>
                        <Input
                            id="duracion-horas"
                            type="number"
                            min="1"
                            max="72"
                            value={duracionHoras}
                            onChange={e => setDuracionHoras(e.target.value)}
                            placeholder="8"
                        />
                        <p className="text-xs text-slate-400">Tiempo hasta que el stock se agota visualmente. Recomendado: 4–12 h.</p>
                    </div>

                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando}>
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
