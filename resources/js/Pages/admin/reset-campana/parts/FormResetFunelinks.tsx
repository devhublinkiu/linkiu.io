import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Textarea } from '@/Components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/Select'
import { Switch } from '@/Components/ui/Switch'
import type { ProductoOpt } from '../Index'

interface Props {
    productos: ProductoOpt[]
}

interface Preview {
    conteo_sesiones: number
    conteo_visitas:  number
    conteo_fomo:     number
}

const HOY = new Date().toISOString().slice(0, 10)
const HACE_30 = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10)

export default function FormResetFunelinks({ productos }: Props) {
    const [desde,          setDesde]          = useState<string>(HACE_30)
    const [hasta,          setHasta]          = useState<string>(HOY)
    const [productoId,     setProductoId]     = useState<string>('todos')
    const [borrarSesiones, setBorrarSesiones] = useState(true)
    const [borrarVisitas,  setBorrarVisitas]  = useState(true)
    const [borrarFomo,     setBorrarFomo]     = useState(true)
    const [motivo,         setMotivo]         = useState('')
    const [confirmacion,   setConfirmacion]   = useState('')
    const [preview,        setPreview]        = useState<Preview | null>(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [enviando,       setEnviando]       = useState(false)

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Carga el conteo previo cada vez que cambian filtros, con debounce 400ms.
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setPreviewLoading(true)
            axios.post(route('admin.reset-campana.funelinks.preview'), {
                desde,
                hasta,
                producto_id:     productoId === 'todos' ? null : Number(productoId),
                borrar_sesiones: borrarSesiones,
                borrar_visitas:  borrarVisitas,
                borrar_fomo:     borrarFomo,
            })
                .then(r => setPreview(r.data))
                .catch(() => setPreview(null))
                .finally(() => setPreviewLoading(false))
        }, 400)
    }, [desde, hasta, productoId, borrarSesiones, borrarVisitas, borrarFomo])

    const fraseEsperada    = `BORRAR ${desde} a ${hasta}`
    const confirmacionOk   = confirmacion === fraseEsperada
    const algunBorrado     = borrarSesiones || borrarVisitas || borrarFomo
    const motivoOk         = motivo.trim().length >= 10 && motivo.trim().length <= 200
    const totalABorrar     = (preview?.conteo_sesiones ?? 0) + (preview?.conteo_visitas ?? 0) + (preview?.conteo_fomo ?? 0)
    const puedeEnviar      = confirmacionOk && motivoOk && algunBorrado && totalABorrar > 0 && !enviando

    function ejecutar() {
        if (!puedeEnviar) return
        setEnviando(true)
        router.post(route('admin.reset-campana.funelinks'), {
            desde,
            hasta,
            producto_id:     productoId === 'todos' ? null : Number(productoId),
            borrar_sesiones: borrarSesiones,
            borrar_visitas:  borrarVisitas,
            borrar_fomo:     borrarFomo,
            motivo:          motivo.trim(),
            confirmacion,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setMotivo('')
                setConfirmacion('')
            },
            onError: (errors) => {
                const primer = Object.values(errors)[0]
                toast.error(typeof primer === 'string' ? primer : 'Error al ejecutar el reset')
            },
            onFinish: () => setEnviando(false),
        })
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Reset de Funelinks</h2>
                <p className="text-xs text-slate-500 mt-0.5">Borra sesiones de visitantes, visitas y logs de fomo en un rango.</p>
            </div>

            <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Desde</Label>
                        <Input type="date" value={desde} onChange={e => setDesde(e.target.value)} max={hasta} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Hasta</Label>
                        <Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} min={desde} max={HOY} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>Producto</Label>
                    <Select value={productoId} onValueChange={setProductoId}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos los productos</SelectItem>
                            {productos.map(p => (
                                <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-3">
                    <p className="text-xs font-medium text-slate-700">Qué borrar</p>
                    {[
                        { id: 'sesiones', label: 'Sesiones de visitantes', desc: 'Recorridos y métricas (Score / Temperatura / Tendencia / Señal).', value: borrarSesiones, set: setBorrarSesiones, count: preview?.conteo_sesiones },
                        { id: 'visitas',  label: 'Visitas registradas',    desc: 'Contador histórico en product_views.',                              value: borrarVisitas,  set: setBorrarVisitas,  count: preview?.conteo_visitas  },
                        { id: 'fomo',     label: 'Logs de fomo',           desc: 'Datos del badge "X personas vieron este producto".',                value: borrarFomo,     set: setBorrarFomo,     count: preview?.conteo_fomo     },
                    ].map(item => (
                        <div key={item.id} className="flex items-start justify-between gap-3 py-1">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                {item.value && (
                                    <p className="text-[11px] font-medium text-slate-600 mt-1.5 tabular-nums">
                                        {previewLoading ? 'Calculando…' : `${(item.count ?? 0).toLocaleString('es-CO')} registros en el rango`}
                                    </p>
                                )}
                            </div>
                            <Switch checked={item.value} onCheckedChange={item.set} />
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-3">
                    <div className="space-y-1.5">
                        <Label>Motivo</Label>
                        <Textarea
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            placeholder="Ej. Inicio de campaña marzo 2026 — reset de baseline previa."
                            rows={2}
                            maxLength={200}
                        />
                        <p className="text-[10px] text-slate-400">{motivo.length}/200 · mínimo 10 caracteres</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Para confirmar, tipea exacto: <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded text-slate-700">{fraseEsperada}</code></Label>
                        <Input
                            value={confirmacion}
                            onChange={e => setConfirmacion(e.target.value)}
                            placeholder={fraseEsperada}
                            className={confirmacion.length > 0 && !confirmacionOk ? 'border-red-300 focus:border-red-300' : ''}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-500">
                        {totalABorrar > 0
                            ? <>Se borrarán <strong className="text-red-600">{totalABorrar.toLocaleString('es-CO')}</strong> registros.</>
                            : 'Sin datos en el rango seleccionado.'}
                    </p>
                    <Button
                        type="button"
                        onClick={ejecutar}
                        disabled={!puedeEnviar}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <Trash2 className="size-3.5" />
                        {enviando ? 'Borrando…' : 'Eliminar permanentemente'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
