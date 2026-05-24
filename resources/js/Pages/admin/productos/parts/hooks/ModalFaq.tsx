import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { HOOK_LIMITS, postHookConfig } from '@/lib/hooks'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'

interface Faq { pregunta: string; respuesta: string }

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

const MAX = HOOK_LIMITS.FAQ

export default function ModalFaq({ open, onClose, productoId, config }: Props) {
    const [titulo,    setTitulo]    = useState((config?.titulo as string) ?? '')
    const [faqs,      setFaqs]      = useState<Faq[]>((config?.faqs as Faq[]) ?? [])
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo((config?.titulo as string) ?? '')
        setFaqs((config?.faqs as Faq[]) ?? [])
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    function agregar() {
        if (faqs.length >= MAX) return
        setFaqs(prev => [...prev, { pregunta: '', respuesta: '' }])
    }

    function actualizar(i: number, campo: keyof Faq, valor: string) {
        setFaqs(prev => prev.map((f, idx) => idx === i ? { ...f, [campo]: valor } : f))
    }

    function eliminar(i: number) {
        setFaqs(prev => prev.filter((_, idx) => idx !== i))
    }

    function guardar() {
        const validas = faqs.filter(f => f.pregunta.trim() && f.respuesta.trim())
        setGuardando(true)
        postHookConfig({
            productoId,
            hookKey: 'preguntas_frecuentes',
            config:  { titulo: titulo.trim() || undefined, faqs: validas },
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <Sheet open={open} onOpenChange={handleOpen}>
            <SheetContent className="sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>Preguntas frecuentes</SheetTitle>
                    <SheetDescription>Acordeón de preguntas y respuestas (máx. {MAX}).</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label>Título <span className="text-slate-500">(opcional)</span></Label>
                        <Input
                            placeholder="Preguntas frecuentes"
                            value={titulo}
                            onChange={e => setTitulo(e.target.value)}
                        />
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">Pregunta {i + 1}</span>
                                    <button type="button" onClick={() => eliminar(i)} className="text-slate-300 hover:text-red-500 transition-colors duration-200">
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                                <Input
                                    placeholder="¿La pregunta?"
                                    value={faq.pregunta}
                                    onChange={e => actualizar(i, 'pregunta', e.target.value)}
                                />
                                <Textarea
                                    rows={2}
                                    placeholder="La respuesta…"
                                    value={faq.respuesta}
                                    onChange={e => actualizar(i, 'respuesta', e.target.value)}
                                />
                            </div>
                        ))}

                        {faqs.length < MAX && (
                            <button
                                type="button"
                                onClick={agregar}
                                className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-sm text-slate-500 transition-colors duration-200 hover:border-slate-400 hover:text-slate-700"
                            >
                                <Plus className="size-4" /> Agregar pregunta
                            </button>
                        )}
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || faqs.length === 0}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
