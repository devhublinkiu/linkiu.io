import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, X } from 'lucide-react'
import { postHookConfig } from '@/lib/hooks'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'

interface Spec { nombre: string; valor: string }

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

export default function ModalFichaTecnica({ open, onClose, productoId, config }: Props) {
    const [titulo,      setTitulo]      = useState((config?.titulo      as string) ?? 'Ficha técnica')
    const [descripcion, setDescripcion] = useState((config?.descripcion as string) ?? '')
    const [specs,     setSpecs]     = useState<Spec[]>((config?.specs    as Spec[])   ?? [])
    const [sinLista,  setSinLista]  = useState<string[]>((config?.sin_lista as string[]) ?? [])
    const [sinInput,  setSinInput]  = useState('')
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo((config?.titulo      as string) ?? 'Ficha técnica')
        setDescripcion((config?.descripcion as string) ?? '')
        setSpecs((config?.specs    as Spec[])   ?? [])
        setSinLista((config?.sin_lista as string[]) ?? [])
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    function agregarSpec() {
        setSpecs(prev => [...prev, { nombre: '', valor: '' }])
    }

    function actualizarSpec(i: number, campo: keyof Spec, v: string) {
        setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [campo]: v } : s))
    }

    function agregarSin() {
        const t = sinInput.trim()
        if (!t || sinLista.includes(t)) return
        setSinLista(prev => [...prev, t])
        setSinInput('')
    }

    function guardar() {
        setGuardando(true)
        postHookConfig({
            productoId,
            hookKey: 'ficha_tecnica',
            config:  { titulo, descripcion, specs: specs.filter(s => s.nombre.trim()), sin_lista: sinLista },
            onSuccess: () => onClose(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <Sheet open={open} onOpenChange={handleOpen}>
            <SheetContent className="sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle>Ficha técnica</SheetTitle>
                    <SheetDescription>Especificaciones clave + lista de lo que no contiene.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Título</label>
                            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Descripción <span className="text-slate-500">(opcional)</span></label>
                            <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Opcional"
                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-xs font-medium text-slate-700 mb-2">Especificaciones</p>
                        <div className="space-y-2">
                            {specs.map((s, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input type="text" placeholder="Título" value={s.nombre} onChange={e => actualizarSpec(i, 'nombre', e.target.value)}
                                        className="flex-1 h-8 rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
                                    />
                                    <input type="text" placeholder="Subtítulo" value={s.valor} onChange={e => actualizarSpec(i, 'valor', e.target.value)}
                                        className="flex-1 h-8 rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
                                    />
                                    <button type="button" onClick={() => setSpecs(prev => prev.filter((_, idx) => idx !== i))}
                                        className="text-slate-300 hover:text-red-500 transition-colors duration-200">
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={agregarSpec}
                                className="flex h-8 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-xs text-slate-500 transition-colors duration-200 hover:border-slate-400">
                                <Plus className="size-3.5" /> Agregar especificación
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-xs font-medium text-slate-700 mb-2">Libre de (tags)</p>
                        <div className="flex gap-2 mb-2">
                            <input type="text" placeholder="Ej. Amoníaco" value={sinInput} onChange={e => setSinInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && agregarSin()}
                                className="flex-1 h-8 rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
                            />
                            <button type="button" onClick={agregarSin}
                                className="h-8 rounded bg-slate-100 px-3 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors duration-200">
                                Agregar
                            </button>
                        </div>
                        {sinLista.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {sinLista.map(item => (
                                    <span key={item} className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                                        {item}
                                        <button type="button" onClick={() => setSinLista(prev => prev.filter(s => s !== item))}>
                                            <X className="size-3 text-slate-500 hover:text-red-500" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || (specs.length === 0 && sinLista.length === 0)}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
