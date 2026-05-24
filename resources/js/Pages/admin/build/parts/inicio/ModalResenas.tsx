import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, StarIcon, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'

export interface ResenaItem {
    nombre:     string
    ciudad:     string
    estrellas:  number
    comentario: string
}

export interface ResenasConfig {
    titulo:      string | null
    descripcion: string | null
    items:       ResenaItem[]
}

interface Props {
    open:     boolean
    onClose:  () => void
    config:   ResenasConfig | null
    disabled: boolean
}

const MAX = 12

function StarSelector({ value, onChange, disabled }: {
    value:    number
    onChange: (v: number) => void
    disabled: boolean
}) {
    return (
        <div className="flex gap-0.5 shrink-0">
            {[1, 2, 3, 4, 5].map(i => (
                <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(i)}
                    className="disabled:cursor-not-allowed"
                >
                    <StarIcon
                        className={`w-4 h-4 transition-colors duration-100 ${i <= value ? 'text-amber-500' : 'text-slate-200 hover:text-amber-500'}`}
                        fill="currentColor"
                    />
                </button>
            ))}
        </div>
    )
}

function itemVacio(): ResenaItem {
    return { nombre: '', ciudad: '', estrellas: 5, comentario: '' }
}

export default function ModalResenas({ open, onClose, config, disabled }: Props) {
    const [titulo,      setTitulo]      = useState<string>('')
    const [descripcion, setDescripcion] = useState<string>('')
    const [items,       setItems]       = useState<ResenaItem[]>([])
    const [guardando,   setGuardando]   = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo(config?.titulo      ?? '')
        setDescripcion(config?.descripcion ?? '')
        setItems(config?.items        ?? [])
    }, [open])

    function actualizarItem(i: number, campo: keyof ResenaItem, valor: string | number) {
        setItems(prev => prev.map((r, idx) => idx === i ? { ...r, [campo]: valor } : r))
    }

    function agregarItem() {
        if (items.length >= MAX) return
        setItems(prev => [...prev, itemVacio()])
    }

    function eliminarItem(i: number) {
        setItems(prev => prev.filter((_, idx) => idx !== i))
    }

    function guardar() {
        const validos = items.filter(r => r.nombre.trim() && r.ciudad.trim() && r.comentario.trim())
        setGuardando(true)
        router.post(route('admin.build.inicio.resenas.config'), {
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
                    <SheetTitle>Reseñas</SheetTitle>
                    <SheetDescription>Testimonios que aparecen en la página principal.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

                    {/* Textos de la sección */}
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="resenas-titulo">Título</Label>
                            <Input
                                id="resenas-titulo"
                                value={titulo}
                                maxLength={100}
                                disabled={disabled}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Ellas ya confían en SAVIA"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="resenas-desc">Descripción</Label>
                            <Textarea
                                id="resenas-desc"
                                value={descripcion}
                                maxLength={300}
                                disabled={disabled}
                                onChange={e => setDescripcion(e.target.value)}
                                placeholder="Más de 1.200 clientas en todo el país comparten su experiencia."
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Lista de reseñas */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">
                                Reseñas{' '}
                                <span className="font-normal text-slate-400">({items.length}/{MAX})</span>
                            </p>
                            {items.length < MAX && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={disabled}
                                    onClick={agregarItem}
                                >
                                    <Plus className="w-4 h-4" />
                                    Agregar
                                </Button>
                            )}
                        </div>

                        {items.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-6">
                                Sin reseñas. Agrega la primera.
                            </p>
                        )}

                        {items.map((r, i) => (
                            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2">

                                <div className="flex items-center gap-2">
                                    <Input
                                        value={r.nombre}
                                        maxLength={60}
                                        disabled={disabled}
                                        onChange={e => actualizarItem(i, 'nombre', e.target.value)}
                                        placeholder="Nombre"
                                        className="flex-1 bg-white"
                                    />
                                    <Input
                                        value={r.ciudad}
                                        maxLength={60}
                                        disabled={disabled}
                                        onChange={e => actualizarItem(i, 'ciudad', e.target.value)}
                                        placeholder="Ciudad"
                                        className="w-28 bg-white"
                                    />
                                    <StarSelector
                                        value={r.estrellas}
                                        onChange={v => actualizarItem(i, 'estrellas', v)}
                                        disabled={disabled}
                                    />
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => eliminarItem(i)}
                                        className="text-slate-400 hover:text-red-500 transition-colors duration-200 ease-in-out disabled:cursor-not-allowed shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <Textarea
                                    value={r.comentario}
                                    maxLength={400}
                                    disabled={disabled}
                                    onChange={e => actualizarItem(i, 'comentario', e.target.value)}
                                    placeholder="Comentario del cliente…"
                                    rows={2}
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
