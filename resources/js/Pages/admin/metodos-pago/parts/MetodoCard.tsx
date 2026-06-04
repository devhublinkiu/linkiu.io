import { useEffect, useRef, useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { CreditCard, Zap, Banknote, Landmark, Settings, ExternalLink, AlertCircle, Check } from 'lucide-react'
import { Badge } from '@/Components/ui/Badge'
import { Button } from '@/Components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/Select'
import { Input } from '@/Components/ui/Input'
import SwitchConPermiso from './SwitchConPermiso'
import type { MetodoPago } from './types'

interface Props {
    metodo:          MetodoPago
    configurado:     boolean
    infoExtra?:      string
    puedeEditar:     boolean
    onToggle:        () => void
    onConfigurar?:   () => void
    urlExterna?:     string
}

// Contraentrega NO admite descuento — su economía la rige el recargo.
// El backend también valida (CrearOrden.calcularDescuentoMetodoPago), pero
// acá ocultamos el input para no confundir al admin.
const METODOS_SIN_DESCUENTO = ['contraentrega']

type DescuentoTipo = 'ninguno' | 'fijo' | 'porcentaje'

// Iconos por método — fácilmente extensible si sumamos pasarelas.
const ICONOS = {
    mercadopago:   CreditCard,
    bold:          Zap,
    contraentrega: Banknote,
    transferencia: Landmark,
} as Record<string, typeof CreditCard>

/**
 * Card uniforme para cualquier método. Permite dos flujos de configuración:
 *  - `onConfigurar`: abre Sheet con form interno (contraentrega, transferencia)
 *  - `urlExterna`:   link a otra página (Integraciones → Pasarelas para MP/Bold)
 */
export default function MetodoCard({ metodo, configurado, infoExtra, puedeEditar, onToggle, onConfigurar, urlExterna }: Props) {
    const Icon = ICONOS[metodo.clave] ?? CreditCard

    const cfg = (metodo.config ?? {}) as Record<string, unknown>
    const tipoInicial = (cfg.descuento_tipo === 'fijo' || cfg.descuento_tipo === 'porcentaje')
        ? cfg.descuento_tipo as DescuentoTipo
        : 'ninguno'
    const valorInicial = Number(cfg.descuento_valor ?? 0)

    const [tipo,        setTipo]        = useState<DescuentoTipo>(tipoInicial)
    const [valor,       setValor]       = useState<number>(valorInicial)
    const [guardadoVis, setGuardadoVis] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const admiteDescuento = ! METODOS_SIN_DESCUENTO.includes(metodo.clave)

    // Auto-guardado: instantáneo al cambiar tipo, debounce 600ms al cambiar valor.
    // No guarda con valor=0 cuando tipo!=='ninguno' — el backend reglas exige > 0.
    function guardarDescuento(nuevoTipo: DescuentoTipo, nuevoValor: number) {
        if (! puedeEditar) return

        const payload = nuevoTipo === 'ninguno'
            ? { tipo: null, valor: null }
            : { tipo: nuevoTipo, valor: nuevoValor }

        // Si tipo!=='ninguno' pero el valor todavía no es válido, no disparamos
        // el POST — el admin sigue tecleando.
        if (nuevoTipo !== 'ninguno' && (nuevoValor === null || nuevoValor <= 0)) {
            return
        }

        router.post(route('admin.metodos-pago.descuento', metodo.id), payload, {
            preserveScroll: true,
            preserveState:  true,
            onSuccess: () => {
                setGuardadoVis(true)
                setTimeout(() => setGuardadoVis(false), 1500)
            },
            onError: (errors) => {
                const primer = Object.values(errors)[0]
                toast.error(typeof primer === 'string' ? primer : 'Error al guardar el descuento')
            },
        })
    }

    function onCambiarTipo(nuevo: DescuentoTipo) {
        setTipo(nuevo)
        if (nuevo === 'ninguno') {
            setValor(0)
            guardarDescuento('ninguno', 0)
        } else {
            // Al cambiar de "Ninguno" a tipo: si ya había valor, dispara; si no, espera input.
            if (valor > 0) guardarDescuento(nuevo, valor)
        }
    }

    function onCambiarValor(nuevo: number) {
        setValor(nuevo)
        if (tipo === 'ninguno') return

        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => guardarDescuento(tipo, nuevo), 600)
    }

    useEffect(() => () => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
    }, [])

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 flex flex-col gap-4">

            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-slate-900">{metodo.nombre}</h3>
                            <Badge variant={configurado ? 'default' : 'secondary'}>
                                {configurado ? 'Configurado' : 'Sin configurar'}
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{metodo.descripcion}</p>
                        {infoExtra && (
                            <p className="text-[11px] text-slate-400 mt-1">{infoExtra}</p>
                        )}
                    </div>
                </div>
                <SwitchConPermiso
                    checked={metodo.activo}
                    disabled={!configurado}
                    onCheckedChange={onToggle}
                    puedeEditar={puedeEditar}
                />
            </div>

            {!configurado && urlExterna && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-200">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500">Configura las credenciales para activar este método.</p>
                </div>
            )}

            {admiteDescuento && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-700">Descuento por usar este método</p>
                        {guardadoVis && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                                <Check className="size-3" />
                                Guardado
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={tipo} onValueChange={(v) => onCambiarTipo(v as DescuentoTipo)} disabled={!puedeEditar}>
                            <SelectTrigger className="w-[140px] text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ninguno">Sin descuento</SelectItem>
                                <SelectItem value="fijo">Fijo ($)</SelectItem>
                                <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                            </SelectContent>
                        </Select>
                        {tipo !== 'ninguno' && (
                            <div className="flex items-center gap-1.5 flex-1">
                                <Input
                                    type="number"
                                    min={0}
                                    max={tipo === 'porcentaje' ? 50 : 9999999}
                                    step={tipo === 'porcentaje' ? 0.5 : 100}
                                    value={valor || ''}
                                    onChange={(e) => onCambiarValor(parseFloat(e.target.value) || 0)}
                                    disabled={!puedeEditar}
                                    placeholder={tipo === 'porcentaje' ? '5' : '5000'}
                                    className="flex-1 text-sm"
                                />
                                <span className="text-xs font-medium text-slate-500 shrink-0">
                                    {tipo === 'porcentaje' ? '%' : 'COP'}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                        Se resta del subtotal del cliente cuando elige este método (antes de envío).
                    </p>
                </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                {urlExterna ? (
                    <Link href={urlExterna}>
                        <Button variant="outline" size="sm">
                            <Settings className="size-3.5" />
                            Configurar en Integraciones
                            <ExternalLink className="size-3" />
                        </Button>
                    </Link>
                ) : onConfigurar ? (
                    <Button variant="outline" size="sm" onClick={onConfigurar} disabled={!puedeEditar}>
                        <Settings className="size-3.5" />
                        Configurar
                    </Button>
                ) : null}
            </div>

        </div>
    )
}
