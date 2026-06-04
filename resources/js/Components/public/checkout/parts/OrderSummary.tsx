import { useState } from 'react'
import { MinusIcon, PlusIcon, XIcon } from 'lucide-react'
import { useCart, type CartItem, type CartItemOpcion } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'
import { trackFb } from '@/lib/usePixel'

interface ZonaEnvio {
    id: number
    nombre: string
    departamentos: { id: number; nombre: string; ciudades: { id: number; nombre: string }[] }[]
    tipo_costo: 'gratis' | 'costo_fijo' | 'gratis_desde'
    costo: number | null
    umbral_gratis: number | null
}

function calcularEnvio(
    zonas: ZonaEnvio[],
    ciudad: string,
    subtotal: number
): number | null {
    if (!ciudad) return null

    const zona = zonas.find(z =>
        z.departamentos.some(d =>
            d.ciudades.some(c => c.nombre.toLowerCase() === ciudad.toLowerCase())
        )
    )

    if (!zona) return null

    if (zona.tipo_costo === 'gratis') return 0

    if (zona.tipo_costo === 'gratis_desde') {
        if (zona.umbral_gratis && subtotal >= zona.umbral_gratis) return 0
        return zona.costo ?? 0
    }

    return zona.costo ?? 0
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function MejorarPromo({ item }: { item: CartItem }) {
    const { replaceItem } = useCart()
    const [abierto, setAbierto] = useState(false)

    const opciones = item.opciones ?? []
    if (opciones.length <= 1) return null

    const sorted = [...opciones].sort((a, b) => a.precio - b.precio)
    const currentIndex = sorted.findIndex(o => o.precio === item.precio)
    const sugerencia = currentIndex >= 0 ? sorted[currentIndex + 1] : null

    if (!sugerencia) return null

    function cambiar(opcion: CartItemOpcion) {
        replaceItem(item.id, {
            nombre:   item.nombre,
            imagen:   item.imagen,
            label:    opcion.label,
            cantidad: 1,
            precio:   opcion.precio,
            opciones: item.opciones,
        })
        setAbierto(false)
    }

    return (
        <div className="mt-2">
            {!abierto ? (
                <button
                    onClick={() => setAbierto(true)}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-left hover:bg-amber-100 transition-colors duration-200"
                >
                    <span className="text-sm shrink-0">⚡</span>
                    <p className="flex-1 text-[11px] font-medium text-amber-700 leading-tight">
                        Lleva {sugerencia.label}{sugerencia.ahorroMonto ? ` y ahorra ${formatPrecio(sugerencia.ahorroMonto)}` : ' y paga menos por unidad'}
                    </p>
                    <span className="text-[10px] font-semibold text-amber-600 shrink-0">Ver →</span>
                </button>
            ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                        <span className="text-xs font-semibold text-slate-600">Elige tu promo</span>
                        <button
                            onClick={() => setAbierto(false)}
                            className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                        >
                            <XIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="flex flex-col divide-y divide-slate-100">
                        {opciones.map(o => {
                            const esActual = o.precio === item.precio
                            return (
                                <button
                                    key={o.cantidad}
                                    onClick={() => !esActual && cambiar(o)}
                                    disabled={esActual}
                                    className={cn(
                                        'flex items-center justify-between gap-3 px-3 py-3 text-left transition-colors duration-200',
                                        esActual ? 'bg-slate-50 cursor-default' : 'hover:bg-slate-50'
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <p className="text-xs font-semibold text-slate-900">{o.label}</p>
                                            {esActual && (
                                                <span className="text-[9px] font-bold text-slate-400 bg-slate-200 rounded-full px-1.5 py-0.5">actual</span>
                                            )}
                                            {o.badge && !esActual && (
                                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-1.5 py-0.5">{o.badge}</span>
                                            )}
                                        </div>
                                        {(o.ahorroMonto ?? 0) > 0 && !esActual && (
                                            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                                Ahorras {formatPrecio(o.ahorroMonto!)}
                                            </p>
                                        )}
                                    </div>
                                    <span className={cn(
                                        'text-xs font-bold shrink-0',
                                        esActual ? 'text-slate-400' : 'text-slate-900'
                                    )}>
                                        {formatPrecio(o.precio)}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

interface MetodoPagoItem {
    clave:       string
    nombre:      string
    config?:     { recargo?: number | null } & Record<string, unknown>
}

interface Props {
    onConfirmar: () => void
    enviando?: boolean
    recargo?: number
    descuentoMetodo?: number
    zonasEnvio: ZonaEnvio[]
    ciudad: string
    metodoPago?: string
    metodos?: MetodoPagoItem[]
    ocultarBoton?: boolean
}

export default function OrderSummary({ onConfirmar, enviando = false, recargo = 0, descuentoMetodo = 0, zonasEnvio, ciudad, metodoPago = '', metodos = [], ocultarBoton = false }: Props) {
    const { items, removeItem, updateQuantity, total } = useCart()

    const envio = calcularEnvio(zonasEnvio, ciudad, total)
    const totalFinal = total + (envio ?? 0) + recargo - descuentoMetodo
    const metodoSeleccionado = metodos.find(m => m.clave === metodoPago)

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden sticky top-24">

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">Resumen del pedido</h2>
                <p className="text-xs text-slate-400 mt-0.5">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
            </div>

            {/* Items */}
            <div className="px-5 py-4 flex flex-col gap-4 max-h-[400px] overflow-y-auto">
                {items.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-6">Tu carrito está vacío.</p>
                )}

                {items.map(item => (
                    <div key={item.id} className="flex flex-col">
                        <div className="flex items-start gap-3">
                            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                <img src={item.imagen} alt={item.nombre} className="h-12 w-auto object-contain" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 leading-tight">{item.nombre}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{item.label}</p>

                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden w-fit mt-2">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors duration-200"
                                    >
                                        <MinusIcon className="w-3 h-3" />
                                    </button>
                                    <span className="w-7 text-center text-xs font-semibold text-slate-900">{item.cantidad}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors duration-200"
                                    >
                                        <PlusIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <p className="text-sm font-black text-slate-900">{formatPrecio(item.precio * item.cantidad)}</p>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-slate-300 hover:text-red-400 transition-colors duration-200"
                                >
                                    <XIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        <MejorarPromo item={item} />
                    </div>
                ))}
            </div>

            {/* Totales */}
            <div className="px-5 py-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatPrecio(total)}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Envío</span>
                    {envio === null ? (
                        <span className="text-xs text-slate-400 italic">Selecciona ciudad</span>
                    ) : envio === 0 ? (
                        <span className="text-emerald-600 font-medium">Gratis</span>
                    ) : (
                        <span>{formatPrecio(envio)}</span>
                    )}
                </div>

                {recargo > 0 && (
                    <div className="flex items-center justify-between text-sm text-amber-600">
                        <span>Recargo contraentrega</span>
                        <span>{formatPrecio(recargo)}</span>
                    </div>
                )}

                {descuentoMetodo > 0 && (
                    <div className="flex items-center justify-between text-sm text-emerald-600">
                        <span>Descuento por {metodoSeleccionado?.nombre ?? 'método'}</span>
                        <span>-{formatPrecio(descuentoMetodo)}</span>
                    </div>
                )}

                <div className="flex items-center justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100 mt-1">
                    <span>{envio === null ? 'Total parcial' : 'Total'}</span>
                    <span>{formatPrecio(totalFinal)}</span>
                </div>
                {envio === null && (
                    <p className="text-[10px] text-slate-400 -mt-1">* No incluye el costo de envío</p>
                )}
            </div>

            {/* CTA */}
            {!ocultarBoton && <div className="px-5 pb-5 flex flex-col gap-4">
                <button
                    onClick={() => {
                        trackFb('AddPaymentInfo', {
                            value:        totalFinal,
                            currency:     'COP',
                            num_items:    items.reduce((acc, i) => acc + i.cantidad, 0),
                            ciudad,
                            payment_type: metodoPago,
                        })
                        onConfirmar()
                    }}
                    disabled={items.length === 0 || enviando}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-sm"
                >
                    {enviando ? 'Procesando…' : 'Confirmar pedido'}
                </button>

                {/* Disclaimer de compromiso — sin fondo, peso visual menor que
                    las leyendas resaltadas (que son chips de información clave). */}
                <div className="px-1">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-700 mb-1">
                        Tu confirmación es un compromiso
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Al confirmar tu pedido, asumimos los gastos logísticos y pagamos por ti el envío que recibes gratis. Confirma solo si estás 100% seguro de recibirlo.
                    </p>
                </div>

                <p className="text-center text-[10px] text-slate-400">
                    Compra 100% segura · Devolución garantizada
                </p>
            </div>}
        </div>
    )
}
