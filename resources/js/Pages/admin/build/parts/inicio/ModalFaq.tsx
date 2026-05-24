import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { PlusIcon, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'
import { Switch } from '@/Components/ui/Switch'

export interface FaqItem {
    pregunta:          string
    respuesta:         string
    visible_contacto?: boolean
    visible_quienes?:  boolean
}

export interface FaqConfig {
    titulo:      string | null
    descripcion: string | null
    items:       FaqItem[]
}

interface Props {
    open:     boolean
    onClose:  () => void
    config:   FaqConfig | null
    disabled: boolean
}

const MAX = 12

export default function ModalFaq({ open, onClose, config, disabled }: Props) {
    const [titulo,      setTitulo]      = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [items,       setItems]       = useState<FaqItem[]>([])
    const [guardando,   setGuardando]   = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo(config?.titulo           ?? '')
        setDescripcion(config?.descripcion ?? '')
        setItems(config?.items ?? [])
    }, [open])

    function agregar() {
        if (items.length >= MAX) return
        setItems(prev => [...prev, { pregunta: '', respuesta: '', visible_contacto: false, visible_quienes: false }])
    }

    function eliminar(i: number) {
        setItems(prev => prev.filter((_, idx) => idx !== i))
    }

    function actualizar(i: number, campo: keyof FaqItem, valor: string | boolean) {
        setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [campo]: valor } : item))
    }

    function guardar() {
        const validos = items.filter(i => i.pregunta.trim() && i.respuesta.trim())
        if (validos.length === 0) { toast.error('Agrega al menos una pregunta'); return }
        setGuardando(true)
        router.post(route('admin.build.inicio.faq.config'), {
            titulo:      titulo      || null,
            descripcion: descripcion || null,
            items:       validos,
        }, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
            <SheetContent className="sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle>FAQ</SheetTitle>
                    <SheetDescription>Preguntas frecuentes (máx. {MAX}).</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="faq-titulo">Título</Label>
                            <Input
                                id="faq-titulo"
                                value={titulo}
                                maxLength={100}
                                disabled={disabled}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Preguntas frecuentes"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="faq-desc">Descripción</Label>
                            <Textarea
                                id="faq-desc"
                                value={descripcion}
                                maxLength={200}
                                disabled={disabled}
                                onChange={e => setDescripcion(e.target.value)}
                                placeholder="Todo lo que necesitas saber antes de tu primera compra."
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">
                                Preguntas{' '}
                                <span className="font-normal text-slate-400">({items.length}/{MAX})</span>
                            </p>
                        </div>

                        {items.map((item, i) => (
                            <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400 w-4 shrink-0">{i + 1}</span>
                                    <Input
                                        value={item.pregunta}
                                        maxLength={150}
                                        disabled={disabled}
                                        onChange={e => actualizar(i, 'pregunta', e.target.value)}
                                        placeholder="¿Cuál es la pregunta?"
                                        className="flex-1"
                                    />
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => eliminar(i)}
                                        className="text-slate-400 hover:text-red-500 transition-colors duration-200 ease-in-out disabled:cursor-not-allowed shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="pl-6">
                                    <Textarea
                                        value={item.respuesta}
                                        maxLength={600}
                                        disabled={disabled}
                                        onChange={e => actualizar(i, 'respuesta', e.target.value)}
                                        placeholder="Escribe la respuesta…"
                                        rows={3}
                                    />
                                </div>
                                <div className="pl-6 flex items-center gap-5 pt-1">
                                    <Label className="flex items-center gap-2 cursor-pointer select-none font-normal">
                                        <Switch
                                            checked={!!item.visible_contacto}
                                            onCheckedChange={v => actualizar(i, 'visible_contacto', v)}
                                            disabled={disabled}
                                        />
                                        <span className="text-xs text-slate-500">Contacto</span>
                                    </Label>
                                    <Label className="flex items-center gap-2 cursor-pointer select-none font-normal">
                                        <Switch
                                            checked={!!item.visible_quienes}
                                            onCheckedChange={v => actualizar(i, 'visible_quienes', v)}
                                            disabled={disabled}
                                        />
                                        <span className="text-xs text-slate-500">Quiénes somos</span>
                                    </Label>
                                </div>
                            </div>
                        ))}

                        {items.length < MAX && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={disabled}
                                onClick={agregar}
                                className="w-full"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Agregar pregunta
                            </Button>
                        )}
                    </div>

                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || disabled}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
