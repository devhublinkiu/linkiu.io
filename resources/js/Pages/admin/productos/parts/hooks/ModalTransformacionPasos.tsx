import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { HOOK_LIMITS, postHookConfig } from '@/lib/hooks'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'

interface Paso { titulo: string; descripcion: string }

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

const MAX = HOOK_LIMITS.COMO_FUNCIONA_PASOS

export default function ModalTransformacionPasos({ open, onClose, productoId, config }: Props) {
    const [titulo,      setTitulo]      = useState((config?.titulo      as string) ?? 'Tu transformación')
    const [descripcion, setDescripcion] = useState((config?.descripcion as string) ?? '')
    const [pasos,     setPasos]     = useState<Paso[]>((config?.pasos as Paso[]) ?? [])
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo((config?.titulo      as string) ?? 'Tu transformación')
        setDescripcion((config?.descripcion as string) ?? '')
        setPasos((config?.pasos as Paso[]) ?? [])
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    function agregar() {
        if (pasos.length >= MAX) return
        setPasos(prev => [...prev, { titulo: '', descripcion: '' }])
    }

    function actualizar(i: number, campo: keyof Paso, valor: string) {
        setPasos(prev => prev.map((p, idx) => idx === i ? { ...p, [campo]: valor } : p))
    }

    function eliminar(i: number) {
        setPasos(prev => prev.filter((_, idx) => idx !== i))
    }

    function guardar() {
        const validos = pasos
            .map(p => ({ titulo: p.titulo.trim(), descripcion: (p.descripcion ?? '').trim() }))
            .filter(p => p.titulo.length > 0)

        setGuardando(true)
        postHookConfig({
            productoId,
            hookKey: 'transformacion_pasos',
            config:  {
                titulo:      titulo.trim() || 'Tu transformación',
                descripcion: descripcion.trim(),
                pasos:       validos,
            },
            onSuccess: () => onClose(),
            onError:   (errors) => {
                const primer = errors ? Object.values(errors)[0] : null
                toast.error(typeof primer === 'string' ? primer : 'Error al guardar')
            },
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <Sheet open={open} onOpenChange={handleOpen}>
            <SheetContent className="sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>Transformación en pasos</SheetTitle>
                    <SheetDescription>Grid de tarjetas con pasos numerados (máx. {MAX}).</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Título</label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Descripción <span className="text-slate-500">(opcional)</span></label>
                            <input
                                type="text"
                                value={descripcion}
                                onChange={e => setDescripcion(e.target.value)}
                                placeholder="Opcional"
                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                        {pasos.map((paso, i) => (
                            <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">Paso {i + 1}</span>
                                    <button type="button" onClick={() => eliminar(i)} className="text-slate-300 hover:text-red-500 transition-colors duration-200">
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Título del paso"
                                    value={paso.titulo}
                                    onChange={e => actualizar(i, 'titulo', e.target.value)}
                                    className="w-full h-8 rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
                                />
                                <textarea
                                    rows={2}
                                    placeholder="Descripción…"
                                    value={paso.descripcion}
                                    onChange={e => actualizar(i, 'descripcion', e.target.value)}
                                    className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none resize-none"
                                />
                            </div>
                        ))}

                        {pasos.length < MAX && (
                            <button
                                type="button"
                                onClick={agregar}
                                className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-sm text-slate-500 transition-colors duration-200 hover:border-slate-400 hover:text-slate-700"
                            >
                                <Plus className="size-4" />
                                Agregar paso
                            </button>
                        )}
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || pasos.length === 0}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
