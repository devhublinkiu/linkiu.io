import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'
import IconPicker from '@/Components/ui/IconPicker'

interface Stat { icono: string; valor: string; sub: string }

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

const MAX_STATS = 3

export default function ModalGanchoPromesa({ open, onClose, productoId, config }: Props) {
    const [dolor,       setDolor]       = useState((config?.dolor       as string) ?? '')
    const [promesa,     setPromesa]     = useState((config?.promesa     as string) ?? '')
    const [descripcion, setDescripcion] = useState((config?.descripcion as string) ?? '')
    const [stats,       setStats]       = useState<Stat[]>((config?.stats as Stat[]) ?? [])
    const [guardando,   setGuardando]   = useState(false)

    useEffect(() => {
        if (!open) return
        setDolor((config?.dolor       as string) ?? '')
        setPromesa((config?.promesa     as string) ?? '')
        setDescripcion((config?.descripcion as string) ?? '')
        setStats((config?.stats as Stat[]) ?? [])
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    function agregarStat() {
        if (stats.length >= MAX_STATS) return
        setStats(prev => [...prev, { icono: 'star', valor: '', sub: '' }])
    }

    function actualizarStat(i: number, campo: keyof Stat, valor: string) {
        setStats(prev => prev.map((s, idx) => idx === i ? { ...s, [campo]: valor } : s))
    }

    function guardar() {
        setGuardando(true)
        router.post(
            route('admin.productos.hooks.config', { producto: productoId, hook: 'gancho_promesa' }),
            { config: { dolor, promesa, descripcion, stats: stats.filter(s => s.valor.trim()) } } as any,
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
                    <SheetTitle>Gancho de promesa</SheetTitle>
                    <SheetDescription>Sección oscura de conversión bajo el selector de cantidad.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label>Frase de dolor <span className="text-slate-400">(opcional)</span></Label>
                        <Textarea rows={2} value={dolor} onChange={e => setDolor(e.target.value)}
                            placeholder="¿Cansado de gastar $80.000 en el salón cada mes?"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Promesa principal</Label>
                        <Textarea rows={3} value={promesa} onChange={e => setPromesa(e.target.value)}
                            placeholder="Nuestro producto lo resuelve en casa, en 1 hora."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Descripción <span className="text-slate-400">(opcional)</span></Label>
                        <Textarea rows={2} value={descripcion} onChange={e => setDescripcion(e.target.value)}
                            placeholder="Un párrafo corto que refuerza la promesa."
                        />
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-xs font-medium text-slate-700 mb-3">Stats <span className="text-slate-400">(máx. {MAX_STATS})</span></p>
                        <div className="space-y-3">
                            {stats.map((s, i) => (
                                <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-500">Stat {i + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => setStats(prev => prev.filter((_, idx) => idx !== i))}
                                            className="text-slate-300 hover:text-red-500 transition-colors duration-200"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <IconPicker
                                            value={s.icono}
                                            onChange={v => actualizarStat(i, 'icono', v)}
                                        />
                                        <Input
                                            placeholder="Valor (ej. +10.000)"
                                            value={s.valor}
                                            onChange={e => actualizarStat(i, 'valor', e.target.value)}
                                        />
                                    </div>
                                    <Input
                                        placeholder="Subtexto (ej. clientes satisfechos)"
                                        value={s.sub}
                                        onChange={e => actualizarStat(i, 'sub', e.target.value)}
                                    />
                                </div>
                            ))}
                            {stats.length < MAX_STATS && (
                                <button
                                    type="button"
                                    onClick={agregarStat}
                                    className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-sm text-slate-500 transition-colors duration-200 hover:border-slate-400 hover:text-slate-700"
                                >
                                    <Plus className="size-4" /> Agregar stat
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || !promesa.trim()}>
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
