import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CreditCardIcon, BanknoteIcon, LandmarkIcon, UploadIcon, CopyIcon, CheckIcon, ZapIcon } from 'lucide-react'

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
}

const ICONOS: Record<string, React.ReactNode> = {
    mercadopago:   <CreditCardIcon className="size-5" />,
    bold:          <ZapIcon className="size-5" />,
    contraentrega: <BanknoteIcon className="size-5" />,
    transferencia: <LandmarkIcon className="size-5" />,
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

export default function PaymentMethods({ metodos, metodoPago, onMetodoPago, comprobante, onComprobante }: Props) {
    const seleccionado = metodos.find(m => m.clave === metodoPago)

    return (
        <div>
            <h2 className="text-base font-bold text-slate-900 mb-4">Método de pago</h2>

            <div className="flex flex-col gap-2">
                {metodos.map(m => (
                    <label
                        key={m.clave}
                        className={cn(
                            'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors duration-200',
                            metodoPago === m.clave
                                ? 'border-slate-900 bg-slate-50'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                        )}
                    >
                        <input
                            type="radio"
                            name="metodo-pago"
                            value={m.clave}
                            checked={metodoPago === m.clave}
                            onChange={() => onMetodoPago(m.clave)}
                            className="sr-only"
                        />
                        <span className={cn('shrink-0', metodoPago === m.clave ? 'text-slate-900' : 'text-slate-400')}>
                            {ICONOS[m.clave] ?? <CreditCardIcon className="size-5" />}
                        </span>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">{m.nombre}</p>
                            <p className="text-xs text-slate-400">{m.descripcion}</p>
                        </div>
                        <div className={cn(
                            'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-200',
                            metodoPago === m.clave ? 'border-slate-900' : 'border-slate-300'
                        )}>
                            {metodoPago === m.clave && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                        </div>
                    </label>
                ))}
            </div>

            {/* Detalle Mercado Pago — el brick se renderiza debajo en el checkout */}
            {seleccionado?.clave === 'mercadopago' && (
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Acepta tarjetas, PSE y Efecty. Ingresa los datos a continuación.</span>
                </div>
            )}

            {/* Detalle Bold — el botón se renderiza debajo en el checkout */}
            {seleccionado?.clave === 'bold' && (
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Tarjetas, PSE, Nequi, Bancolombia y QR. Pagas dentro de la página, sin redirección.</span>
                </div>
            )}

            {/* Detalle Contraentrega */}
            {seleccionado?.clave === 'contraentrega' && (
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-1">
                    <p className="text-sm text-slate-600">Paga en efectivo al momento de recibir tu pedido.</p>
                    {Number(seleccionado.config?.recargo) > 0 && (
                        <p className="text-sm font-medium text-amber-600">
                            Se aplica un recargo de {formatPrecio(Number(seleccionado.config.recargo))} al total del pedido.
                        </p>
                    )}
                </div>
            )}

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
