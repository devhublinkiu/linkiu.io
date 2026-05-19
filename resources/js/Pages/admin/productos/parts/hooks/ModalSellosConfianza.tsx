import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import IconPicker from '@/Components/ui/IconPicker'

interface Sello { icono: string; titulo: string; sub: string }

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

const MAX = 3

export default function ModalSellosConfianza({ open, onClose, productoId, config }: Props) {
    const [sellos,    setSellos]    = useState<Sello[]>((config?.sellos as Sello[]) ?? [])
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        if (!open) return
        setSellos((config?.sellos as Sello[]) ?? [])
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    function agregar() {
        if (sellos.length >= MAX) return
        setSellos(prev => [...prev, { icono: 'shield-check', titulo: '', sub: '' }])
    }

    function actualizar(i: number, campo: keyof Sello, valor: string) {
        setSellos(prev => prev.map((s, idx) => idx === i ? { ...s, [campo]: valor } : s))
    }

    function guardar() {
        const validos = sellos.filter(s => s.titulo.trim())
        setGuardando(true)
        router.post(
            route('admin.productos.hooks.config', { producto: productoId, hook: 'sellos_confianza' }),
            { config: { sellos: validos } } as any,
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
                    <SheetTitle>Sellos de confianza</SheetTitle>
                    <SheetDescription>Ícono + título + subtítulo (máx. {MAX}).</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    {sellos.map((sello, i) => (
                        <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">

                            {/* Cabecera con número y eliminar */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">Sello {i + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => setSellos(prev => prev.filter((_, idx) => idx !== i))}
                                    className="text-slate-300 hover:text-red-500 transition-colors duration-200"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>

                            {/* Fila: icono + título */}
                            <div className="flex gap-2 items-center">
                                <IconPicker
                                    value={sello.icono}
                                    onChange={v => actualizar(i, 'icono', v)}
                                />
                                <Input
                                    placeholder="Título (ej. Envío gratis)"
                                    value={sello.titulo}
                                    onChange={e => actualizar(i, 'titulo', e.target.value)}
                                />
                            </div>

                            {/* Subtítulo */}
                            <Input
                                placeholder="Subtítulo (ej. A todo el país)"
                                value={sello.sub}
                                onChange={e => actualizar(i, 'sub', e.target.value)}
                            />
                        </div>
                    ))}

                    {sellos.length < MAX && (
                        <button
                            type="button"
                            onClick={agregar}
                            className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-sm text-slate-500 transition-colors duration-200 hover:border-slate-400 hover:text-slate-700"
                        >
                            <Plus className="size-4" /> Agregar sello
                        </button>
                    )}
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || sellos.length === 0}>
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
