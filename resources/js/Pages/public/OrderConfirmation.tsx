import { type ReactNode } from 'react'
import { Link } from '@inertiajs/react'
import { CheckIcon, PackageIcon, TruckIcon, ClipboardCheckIcon, HomeIcon, MessageCircleIcon, RotateCcwIcon, ShieldCheckIcon } from 'lucide-react'
import WebLayout from '@/Layouts/WebLayout'
import { cn } from '@/lib/utils'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type EstadoPedido = 'confirmado' | 'preparacion' | 'listo' | 'camino' | 'entregado'

interface ItemPedido {
    nombre: string
    label: string
    imagen: string
    cantidad: number
    precio: number
}

interface Props {
    numeroOrden?: string
    email?: string
    estadoActual?: EstadoPedido
    items?: ItemPedido[]
    total?: number
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_ITEMS: ItemPedido[] = [
    {
        nombre: 'SAVIA Cubre Canas',
        label: 'Castaño Natural',
        imagen: '/assets/products/savia-verde.png',
        cantidad: 1,
        precio: 89900,
    },
]

const PASOS_TIMELINE = [
    {
        id: 'confirmado',
        label: 'Pedido confirmado',
        sub: 'Tu pago fue recibido exitosamente',
        icono: ClipboardCheckIcon,
    },
    {
        id: 'preparacion',
        label: 'En preparación',
        sub: 'Estamos alistando tu pedido',
        icono: PackageIcon,
    },
    {
        id: 'listo',
        label: 'Listo para envío',
        sub: 'En manos de la transportadora',
        icono: PackageIcon,
    },
    {
        id: 'camino',
        label: 'En camino',
        sub: 'Tu pedido está en ruta',
        icono: TruckIcon,
    },
    {
        id: 'entregado',
        label: 'Entregado',
        sub: '¡Disfruta tu compra!',
        icono: HomeIcon,
    },
]

function formatPrecio(n: number) {
    return '$' + n.toLocaleString('es-CO')
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({ estadoActual }: { estadoActual: EstadoPedido }) {
    const orden: EstadoPedido[] = ['confirmado', 'preparacion', 'listo', 'camino', 'entregado']
    const indexActual = orden.indexOf(estadoActual)

    return (
        <div className="flex flex-col gap-0">
            {PASOS_TIMELINE.map((paso, i) => {
                const completado = i < indexActual
                const activo    = i === indexActual
                const pendiente = i > indexActual
                const Icono     = paso.icono
                const ultimo    = i === PASOS_TIMELINE.length - 1

                return (
                    <div key={paso.id} className="flex gap-4">
                        {/* Indicador + línea */}
                        <div className="flex flex-col items-center shrink-0">
                            <div className={cn(
                                'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
                                completado && 'bg-emerald-500',
                                activo     && 'bg-amber-500 ring-4 ring-amber-500/20',
                                pendiente  && 'bg-slate-100 border-2 border-slate-200'
                            )}>
                                {completado && <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />}
                                {activo     && <Icono className="w-4 h-4 text-white" />}
                                {pendiente  && <Icono className="w-4 h-4 text-slate-300" />}
                            </div>
                            {!ultimo && (
                                <div className={cn(
                                    'w-0.5 flex-1 min-h-[2rem] my-1 transition-colors duration-300',
                                    completado ? 'bg-emerald-200' : 'bg-slate-100'
                                )} />
                            )}
                        </div>

                        {/* Texto */}
                        <div className={cn('pb-6', ultimo && 'pb-0')}>
                            <p className={cn(
                                'text-sm font-semibold leading-tight',
                                completado && 'text-emerald-700',
                                activo     && 'text-slate-900',
                                pendiente  && 'text-slate-400'
                            )}>
                                {paso.label}
                                {activo && (
                                    <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-breathe" />
                                        Ahora
                                    </span>
                                )}
                            </p>
                            <p className={cn(
                                'text-xs mt-0.5',
                                completado ? 'text-emerald-600' : pendiente ? 'text-slate-300' : 'text-slate-500'
                            )}>
                                {paso.sub}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Página ───────────────────────────────────────────────────────────────────

function OrderConfirmation({
    numeroOrden = 'SAVIA-2025-00142',
    email = 'tu@correo.com',
    estadoActual = 'confirmado',
    items = MOCK_ITEMS,
    total = 89900,
}: Props) {
    const envio = total >= 89900 ? 0 : 9900

    return (
        <div className="bg-slate-50 min-h-screen py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-6">

                {/* ── Encabezado ── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-5 shadow-md shadow-emerald-200">
                        <CheckIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">¡Gracias por tu compra!</h1>
                    <p className="text-slate-500 mt-1.5 max-w-md">
                        Tu pedido está confirmado. Enviamos la confirmación a{' '}
                        <span className="font-medium text-slate-700">{email}</span>
                    </p>
                    <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium">Número de orden</span>
                        <span className="text-sm font-black text-slate-900 tracking-wide"># {numeroOrden}</span>
                    </div>
                </div>

                {/* ── Cuerpo principal ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

                    {/* Columna izquierda */}
                    <div className="flex flex-col gap-6">

                        {/* Timeline */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6">
                            <h2 className="text-sm font-bold text-slate-900 mb-6">Estado del pedido</h2>
                            <Timeline estadoActual={estadoActual} />
                        </div>

                        {/* Info adicional */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <TruckIcon className="w-4 h-4 text-emerald-600" />
                                </div>
                                <p className="text-xs font-bold text-slate-900">Envío estimado</p>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    3 a 5 días hábiles a todo el país. Te notificamos cuando esté en camino.
                                </p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <RotateCcwIcon className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="text-xs font-bold text-slate-900">Devoluciones</p>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Tienes 15 días para solicitar devolución. Sin preguntas, sin complicaciones.
                                </p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <MessageCircleIcon className="w-4 h-4 text-amber-600" />
                                </div>
                                <p className="text-xs font-bold text-slate-900">¿Necesitas ayuda?</p>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Escríbenos por WhatsApp o al correo y te respondemos en menos de 2 horas.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Columna derecha — Resumen */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden sticky top-24">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">Resumen del pedido</h2>
                        </div>

                        <div className="px-5 py-4 flex flex-col divide-y divide-slate-100">
                            {items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                        <img src={item.imagen} alt={item.nombre} className="h-10 w-auto object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">{item.nombre}</p>
                                        <p className="text-[10px] text-slate-400">{item.label}</p>
                                        <p className="text-[10px] text-slate-400">Cantidad: {item.cantidad}</p>
                                    </div>
                                    <p className="text-sm font-black text-slate-900 shrink-0">
                                        {formatPrecio(item.precio * item.cantidad)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="px-5 py-4 border-t border-slate-100 flex flex-col gap-2">
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Subtotal</span>
                                <span>{formatPrecio(total)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Envío</span>
                                {envio === 0
                                    ? <span className="text-emerald-600 font-medium">Gratis</span>
                                    : <span>{formatPrecio(envio)}</span>
                                }
                            </div>
                            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100 mt-1">
                                <span>Total pagado</span>
                                <span>{formatPrecio(total + envio)}</span>
                            </div>
                        </div>

                        <div className="px-5 pb-5 flex flex-col gap-2">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center mb-1">
                                <ShieldCheckIcon className="w-3 h-3" />
                                Compra verificada y protegida
                            </div>
                            <Link
                                href="/productos"
                                className="w-full block text-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold py-3 rounded-xl transition-all duration-200"
                            >
                                Seguir comprando
                            </Link>
                            <Link
                                href="/"
                                className="w-full block text-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200 py-2"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

OrderConfirmation.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default OrderConfirmation
