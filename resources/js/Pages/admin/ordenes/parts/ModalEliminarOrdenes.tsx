import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Trash2, X } from 'lucide-react'
import { Button } from '@/Components/ui/Button'
import { Textarea } from '@/Components/ui/Textarea'
import { Label } from '@/Components/ui/Label'

interface OrdenSeleccionable {
    id:     number
    codigo: string
}

interface Props {
    abierto:        boolean
    seleccionadas:  OrdenSeleccionable[]
    onCerrar:       () => void
    onCompletado:   () => void
}

export default function ModalEliminarOrdenes({ abierto, seleccionadas, onCerrar, onCompletado }: Props) {
    const [motivo,    setMotivo]    = useState('')
    const [acepta,    setAcepta]    = useState(false)
    const [enviando,  setEnviando]  = useState(false)

    useEffect(() => {
        if (!abierto) return
        setMotivo('')
        setAcepta(false)
    }, [abierto])

    if (!abierto) return null

    const motivoOk = motivo.trim().length >= 10 && motivo.trim().length <= 200
    const puede    = motivoOk && acepta && !enviando && seleccionadas.length > 0

    function ejecutar() {
        if (!puede) return
        setEnviando(true)
        router.delete(route('admin.ordenes.bulk-destroy'), {
            data: {
                ids:       seleccionadas.map(o => o.id),
                motivo:    motivo.trim(),
                confirmar: true,
            },
            preserveScroll: true,
            onSuccess: () => onCompletado(),
            onError:   (errors) => {
                const primer = Object.values(errors)[0]
                toast.error(typeof primer === 'string' ? primer : 'Error al eliminar las órdenes')
            },
            onFinish:  () => setEnviando(false),
        })
    }

    const mostrar = seleccionadas.slice(0, 5)
    const restantes = seleccionadas.length - mostrar.length

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCerrar}>
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl m-4" onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Eliminar {seleccionadas.length} órdenes</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Esta acción es permanente y no se puede deshacer.</p>
                        </div>
                    </div>
                    <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 transition-colors duration-200">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-5 py-4 space-y-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[11px] text-slate-700 leading-relaxed">
                        {mostrar.map(o => o.codigo).join(', ')}
                        {restantes > 0 && <span className="text-slate-400"> · +{restantes} más</span>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Motivo</Label>
                        <Textarea
                            rows={3}
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            placeholder="Ej. Órdenes de prueba previas al lanzamiento de campaña."
                            maxLength={200}
                        />
                        <p className="text-[10px] text-slate-400">{motivo.length}/200 · mínimo 10 caracteres</p>
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={acepta}
                            onChange={e => setAcepta(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300"
                        />
                        <span className="text-xs text-slate-700 leading-snug">
                            Entiendo que esta acción es <strong>permanente</strong>, que se borrarán los comprobantes en S3, y que solo queda registro en el audit log.
                        </span>
                    </label>
                </div>

                <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
                    <Button variant="outline" onClick={onCerrar} disabled={enviando}>Cancelar</Button>
                    <Button onClick={ejecutar} disabled={!puede} className="bg-red-600 hover:bg-red-700 text-white">
                        {enviando ? 'Eliminando…' : `Eliminar ${seleccionadas.length} órdenes`}
                    </Button>
                </div>
            </div>
        </div>
    )
}
