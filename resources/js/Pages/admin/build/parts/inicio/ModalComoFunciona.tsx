import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'
import TokenSelector from '../TokenSelector'

export interface PasoItem {
    titulo:      string
    descripcion: string
    badge:       string | null
}

export interface ComoFuncionaConfig {
    titulo:       string | null
    descripcion:  string | null
    color_acento: string
    items:        PasoItem[]
}

interface Colores { primario: string; secundario: string; acento: string }

interface Props {
    open:     boolean
    onClose:  () => void
    config:   ComoFuncionaConfig | null
    colores:  Colores
    disabled: boolean
}

const MAX = 5

export default function ModalComoFunciona({ open, onClose, config, colores, disabled }: Props) {
    const [titulo,      setTitulo]      = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [colorAcento, setColorAcento] = useState('acento')
    const [items,       setItems]       = useState<PasoItem[]>([])
    const [guardando,   setGuardando]   = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo(config?.titulo         ?? '')
        setDescripcion(config?.descripcion ?? '')
        setColorAcento(config?.color_acento ?? 'acento')
        setItems(config?.items             ?? [])
    }, [open])

    function actualizar(i: number, campo: keyof PasoItem, valor: string) {
        setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [campo]: valor || null } : it))
    }

    function guardar() {
        const validos = items.filter(it => it.titulo.trim())
        setGuardando(true)
        router.post(route('admin.build.inicio.como_funciona.config'), {
            titulo:       titulo      || null,
            descripcion:  descripcion || null,
            color_acento: colorAcento,
            items:        validos,
        }, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    const tokenOpciones = [
        { label: 'Principal',  value: 'primario',   hex: colores.primario   },
        { label: 'Secundario', value: 'secundario', hex: colores.secundario },
        { label: 'Acento',     value: 'acento',     hex: colores.acento     },
        { label: 'Blanco',     value: 'blanco',     hex: '#FFFFFF'          },
        { label: 'Negro',      value: 'negro',      hex: '#000000'          },
    ]

    return (
        <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
            <SheetContent className="sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle>Cómo funciona</SheetTitle>
                    <SheetDescription>Pasos del proceso de compra.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

                    {/* Textos de sección */}
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="cf-titulo">Título</Label>
                            <Input
                                id="cf-titulo"
                                value={titulo}
                                maxLength={100}
                                disabled={disabled}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Comprar nunca fue tan fácil"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="cf-desc">Descripción</Label>
                            <Textarea
                                id="cf-desc"
                                value={descripcion}
                                maxLength={200}
                                disabled={disabled}
                                onChange={e => setDescripcion(e.target.value)}
                                placeholder="De tu elección a tu puerta en tres pasos simples."
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    <TokenSelector
                        label="Color de acento"
                        value={colorAcento}
                        onChange={setColorAcento}
                        opciones={tokenOpciones}
                        disabled={disabled}
                    />

                    <div className="border-t border-slate-100" />

                    {/* Pasos */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">
                                Pasos{' '}
                                <span className="font-normal text-slate-400">({items.length}/{MAX})</span>
                            </p>
                            {items.length < MAX && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={disabled}
                                    onClick={() => setItems(prev => [...prev, { titulo: '', descripcion: '', badge: null }])}
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar paso
                                </Button>
                            )}
                        </div>

                        {items.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-6">
                                Sin pasos. Agrega el primero.
                            </p>
                        )}

                        {items.map((item, i) => (
                            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-400">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <Input
                                        value={item.titulo}
                                        maxLength={60}
                                        disabled={disabled}
                                        onChange={e => actualizar(i, 'titulo', e.target.value)}
                                        placeholder="Título del paso"
                                        className="flex-1 bg-white"
                                    />
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
                                        className="text-slate-400 hover:text-red-500 transition-colors duration-200 ease-in-out disabled:cursor-not-allowed shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <Textarea
                                    value={item.descripcion}
                                    maxLength={200}
                                    disabled={disabled}
                                    onChange={e => actualizar(i, 'descripcion', e.target.value)}
                                    placeholder="Descripción del paso…"
                                    rows={2}
                                    className="bg-white"
                                />
                                <Input
                                    value={item.badge ?? ''}
                                    maxLength={60}
                                    disabled={disabled}
                                    onChange={e => actualizar(i, 'badge', e.target.value)}
                                    placeholder="Badge (opcional) — ej. Envío gratis desde $89.900"
                                    className="bg-white"
                                />
                            </div>
                        ))}
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
