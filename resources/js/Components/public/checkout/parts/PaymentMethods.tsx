import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CreditCardIcon, BanknoteIcon, LandmarkIcon, UploadIcon, CopyIcon, CheckIcon, ZapIcon, SparklesIcon } from 'lucide-react'

export interface MetodoPagoPublico {
    clave: string
    nombre: string
    descripcion: string
    config: Record<string, string | number | boolean>
}

interface Props {
    metodos: MetodoPagoPublico[]
    metodoPago: string
    onMetodoPago: (clave: string) => void
    comprobante: File | null
    onComprobante: (file: File | null) => void
    /** Subtotal post-cupón sobre el que se calcula el descuento por método. */
    subtotal: number
}

/**
 * Calcula el monto de descuento que aplicaría un método sobre el subtotal dado.
 * Devuelve 0 si el método no tiene descuento configurado o el subtotal es 0.
 */
function calcularDescuento(m: MetodoPagoPublico, subtotal: number): number {
    const tipo  = m.config?.descuento_tipo
    const valor = Number(m.config?.descuento_valor ?? 0)
    if (! tipo || valor <= 0 || subtotal <= 0) return 0
    if (tipo === 'porcentaje') return Math.round(subtotal * valor / 100)
    if (tipo === 'fijo')       return Math.min(Math.round(valor), subtotal)
    return 0
}

const ICONOS: Record<string, React.ReactNode> = {
    mercadopago:   <CreditCardIcon className="size-5" />,
    bold:          <ZapIcon className="size-5" />,
    contraentrega: <BanknoteIcon className="size-5" />,
    transferencia: <LandmarkIcon className="size-5" />,
}

// Color de la franja superior de cada card por método. Marca visual rápida —
// el cliente distingue a primera vista. Bold = fucsia (su brand), MercadoPago
// = azul (su brand), transferencia = emerald (banco/dinero), contraentrega =
// amber (efectivo). Se aplica a la franja "Te ahorras X" o "Recargo de X".
const COLORES_FRANJA: Record<string, string> = {
    mercadopago:   'bg-sky-600 border-sky-600',
    bold:          'bg-fuchsia-600 border-fuchsia-600',
    transferencia: 'bg-emerald-600 border-emerald-600',
    contraentrega: 'bg-amber-600 border-amber-600',
}

// Color del border de la card cuando NO está seleccionada pero sí destaca
// (tiene ahorro o recargo). Espejo de COLORES_FRANJA en tono más suave.
const COLORES_BORDER: Record<string, string> = {
    mercadopago:   'border-sky-300 hover:border-sky-400',
    bold:          'border-fuchsia-300 hover:border-fuchsia-400',
    transferencia: 'border-emerald-300 hover:border-emerald-400',
    contraentrega: 'border-amber-300 hover:border-amber-400',
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function CampoCopiable({ valor }: { valor: string }) {
    const [copiado, setCopiado] = useState(false)

    function copiar() {
        navigator.clipboard.writeText(valor).then(() => {
            setCopiado(true)
            setTimeout(() => setCopiado(false), 1500)
        })
    }

    return (
        <button
            onClick={copiar}
            className="flex items-center gap-1.5 font-medium text-slate-900 hover:text-slate-600 transition-colors duration-200 group"
        >
            <span>{valor}</span>
            {copiado
                ? <CheckIcon className="size-3 text-emerald-500 shrink-0" />
                : <CopyIcon className="size-3 text-slate-300 group-hover:text-slate-400 transition-colors duration-200 shrink-0" />
            }
        </button>
    )
}

export default function PaymentMethods({ metodos, metodoPago, onMetodoPago, comprobante, onComprobante, subtotal }: Props) {
    const seleccionado = metodos.find(m => m.clave === metodoPago)

    return (
        <div>
            <h2 className="text-base font-bold text-slate-900 mb-4">Método de pago</h2>

            <div className="flex flex-col gap-2">
                {metodos.map(m => {
                    const ahorro       = calcularDescuento(m, subtotal)
                    const tieneAhorro  = ahorro > 0
                    const recargo      = m.clave === 'contraentrega' ? Number(m.config?.recargo ?? 0) : 0
                    const tieneRecargo = recargo > 0
                    const tieneFranja  = tieneAhorro || tieneRecargo
                    const seleccionada = metodoPago === m.clave

                    return (
                        <div
                            key={m.clave}
                            className={cn(
                                'rounded-xl overflow-hidden border transition-colors duration-200',
                                seleccionada
                                    ? 'border-slate-900 bg-slate-50'
                                    : tieneFranja
                                        ? COLORES_BORDER[m.clave] + ' bg-white'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                            )}
                        >
                            {tieneAhorro && (
                                <div className={cn('flex items-center gap-1.5 px-4 py-1.5 border-b', COLORES_FRANJA[m.clave])}>
                                    <SparklesIcon className="size-3 text-white shrink-0" />
                                    <p className="text-[11px] font-semibold text-white leading-tight">
                                        Te ahorras {formatPrecio(ahorro)} pagando con {m.nombre}
                                    </p>
                                </div>
                            )}
                            {tieneRecargo && (
                                <div className={cn('flex items-center gap-1.5 px-4 py-1.5 border-b', COLORES_FRANJA[m.clave])}>
                                    <BanknoteIcon className="size-3 text-white shrink-0" />
                                    <p className="text-[11px] font-semibold text-white leading-tight">
                                        Recargo de {formatPrecio(recargo)} pagando en efectivo
                                    </p>
                                </div>
                            )}
                            <label className="flex items-center gap-4 p-4 cursor-pointer">
                                <input
                                    type="radio"
                                    name="metodo-pago"
                                    value={m.clave}
                                    checked={seleccionada}
                                    onChange={() => onMetodoPago(m.clave)}
                                    className="sr-only"
                                />
                                <span className={cn('shrink-0', seleccionada ? 'text-slate-900' : 'text-slate-400')}>
                                    {ICONOS[m.clave] ?? <CreditCardIcon className="size-5" />}
                                </span>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900">{m.nombre}</p>
                                    <p className="text-xs text-slate-400">{m.descripcion}</p>
                                </div>
                                <div className={cn(
                                    'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-200',
                                    seleccionada ? 'border-slate-900' : 'border-slate-300'
                                )}>
                                    {seleccionada && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                                </div>
                            </label>
                        </div>
                    )
                })}
            </div>


            {/* Detalle Transferencia */}
            {seleccionado?.clave === 'transferencia' && (
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-3">
                    <p className="text-sm text-slate-600">
                        Realiza una transferencia bancaria con los siguientes datos:
                    </p>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {seleccionado.config?.banco && (
                            <>
                                <span className="text-slate-400">Banco</span>
                                <CampoCopiable valor={String(seleccionado.config.banco)} />
                            </>
                        )}
                        {seleccionado.config?.tipo_cuenta && (
                            <>
                                <span className="text-slate-400">Tipo de cuenta</span>
                                <CampoCopiable valor={String(seleccionado.config.tipo_cuenta)} />
                            </>
                        )}
                        {seleccionado.config?.numero_cuenta && (
                            <>
                                <span className="text-slate-400">Número de cuenta</span>
                                <CampoCopiable valor={String(seleccionado.config.numero_cuenta)} />
                            </>
                        )}
                        {seleccionado.config?.titular && (
                            <>
                                <span className="text-slate-400">Titular</span>
                                <CampoCopiable valor={String(seleccionado.config.titular)} />
                            </>
                        )}
                        {seleccionado.config?.tipo_doc && seleccionado.config?.numero_doc && (
                            <>
                                <span className="text-slate-400">{seleccionado.config.tipo_doc}</span>
                                <CampoCopiable valor={String(seleccionado.config.numero_doc)} />
                            </>
                        )}
                    </div>

                    {seleccionado.config?.instrucciones && (
                        <p className="text-xs text-slate-500 border-t border-slate-200 pt-3 whitespace-pre-line">
                            {seleccionado.config.instrucciones}
                        </p>
                    )}

                    {seleccionado.config?.comprobante_requerido && (
                        <div className="border-t border-slate-200 pt-3">
                            <p className="text-xs font-medium text-slate-700 mb-2">
                                Adjunta el comprobante de pago <span className="text-red-500">*</span>
                            </p>
                            <label className={cn(
                                'flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-3 cursor-pointer transition-colors duration-200 hover:border-slate-400',
                                comprobante && 'border-slate-900 bg-slate-50'
                            )}>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="sr-only"
                                    onChange={e => onComprobante(e.target.files?.[0] ?? null)}
                                />
                                <UploadIcon className="size-4 text-slate-400 shrink-0" />
                                <span className="text-sm text-slate-500 truncate">
                                    {comprobante ? comprobante.name : 'Haz clic para subir imagen o PDF'}
                                </span>
                            </label>
                        </div>
                    )}
                </div>
            )}

            <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                <span>🔒</span>
                Tus datos de pago están cifrados y protegidos.
            </p>
        </div>
    )
}
