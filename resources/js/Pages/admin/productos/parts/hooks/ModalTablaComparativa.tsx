import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'

interface Fila { caracteristica: string; valores: (string | boolean)[] }

interface Props {
    open:       boolean
    onClose:    () => void
    productoId: number
    config:     Record<string, unknown> | null
}

const MAX_FILAS = 6

export default function ModalTablaComparativa({ open, onClose, productoId, config }: Props) {
    const [titulo,    setTitulo]    = useState((config?.titulo    as string)   ?? 'Comparativa')
    const [subtitulo, setSubtitulo] = useState((config?.subtitulo as string)   ?? '')
    const [columnas,  setColumnas]  = useState<string[]>((config?.columnas as string[]) ?? ['Nuestro producto', 'Competencia'])
    const [filas,     setFilas]     = useState<Fila[]>((config?.filas as Fila[]) ?? [])
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        if (!open) return
        setTitulo((config?.titulo    as string)   ?? 'Comparativa')
        setSubtitulo((config?.subtitulo as string)   ?? '')
        setColumnas((config?.columnas as string[]) ?? ['Nuestro producto', 'Competencia'])
        setFilas((config?.filas as Fila[]) ?? [])
    }, [open])

    function handleOpen(v: boolean) {
        if (!v) onClose()
    }

    function agregarFila() {
        if (filas.length >= MAX_FILAS) return
        setFilas(prev => [...prev, { caracteristica: '', valores: columnas.map(() => '') }])
    }

    function actualizarCaract(i: number, v: string) {
        setFilas(prev => prev.map((f, idx) => idx === i ? { ...f, caracteristica: v } : f))
    }

    function actualizarValor(fi: number, vi: number, v: string) {
        setFilas(prev => prev.map((f, idx) => {
            if (idx !== fi) return f
            const vals = [...f.valores]
            const trimmed = v.trim().toLowerCase()
            vals[vi] = trimmed === 'si' || trimmed === 'sí' ? true : trimmed === 'no' ? false : v
            return { ...f, valores: vals }
        }))
    }

    function guardar() {
        const validas = filas.filter(f => f.caracteristica.trim())
        setGuardando(true)
        router.post(
            route('admin.productos.hooks.config', { producto: productoId, hook: 'tabla_comparativa' }),
            { config: { titulo, subtitulo, columnas, filas: validas } } as any,
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
            <SheetContent className="sm:max-w-2xl flex flex-col">
                <SheetHeader>
                    <SheetTitle>Tabla comparativa</SheetTitle>
                    <SheetDescription>Hasta {MAX_FILAS} filas. Escribe "si"/"no" para mostrar ✓/✗, o cualquier texto.</SheetDescription>
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
                            <label className="block text-xs font-medium text-slate-700 mb-1">Descripción <span className="text-slate-400">(opcional)</span></label>
                            <input type="text" value={subtitulo} onChange={e => setSubtitulo(e.target.value)} placeholder="Opcional"
                                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-2">Nombres de columnas</label>
                        <div className="flex gap-2">
                            {columnas.map((col, ci) => (
                                <input key={ci} type="text" value={col} onChange={e => setColumnas(prev => prev.map((c, idx) => idx === ci ? e.target.value : c))}
                                    className="flex-1 h-8 rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-2">
                        <p className="text-xs font-medium text-slate-700 mb-2">Filas</p>
                        {filas.map((fila, fi) => (
                            <div key={fi} className="flex gap-2 items-center">
                                <input type="text" placeholder="Característica" value={fila.caracteristica} onChange={e => actualizarCaract(fi, e.target.value)}
                                    className="flex-1 h-8 rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                                />
                                {fila.valores.map((v, vi) => (
                                    <input key={vi} type="text" placeholder={vi === 0 ? 'Nuestro' : 'Rival'} value={typeof v === 'boolean' ? (v ? 'si' : 'no') : (v ?? '')}
                                        onChange={e => actualizarValor(fi, vi, e.target.value)}
                                        className="w-20 h-8 rounded border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                                    />
                                ))}
                                <button type="button" onClick={() => setFilas(prev => prev.filter((_, idx) => idx !== fi))}
                                    className="text-slate-300 hover:text-red-500 transition-colors duration-200">
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        ))}
                        {filas.length < MAX_FILAS && (
                            <button type="button" onClick={agregarFila}
                                className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-sm text-slate-500 transition-colors duration-200 hover:border-slate-400 hover:text-slate-700">
                                <Plus className="size-4" /> Agregar fila
                            </button>
                        )}
                    </div>
                </div>

                <SheetFooter>
                    <Button onClick={guardar} disabled={guardando || filas.length === 0}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
