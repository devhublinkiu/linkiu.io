import { type ReactNode, useEffect, useState } from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { PackageIcon, CheckIcon } from 'lucide-react'
import WebLayout from '@/Layouts/WebLayout'
import { getAblyClient } from '@/ably'

type EstadoOrden = 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'

interface OrdenItem {
    nombre: string
    imagen: string | null
    label: string | null
    cantidad: number
    precio: number
}

interface OrdenSeguimientoData {
    codigo: string
    estado: EstadoOrden
    nombre: string
    ciudad: string
    departamento: string
    metodo_pago: string
    subtotal: number
    costo_envio: number
    recargo: number
    total: number
    numero_guia: string | null
    transportadora: string | null
    created_at: string
    items: OrdenItem[]
}

const PASOS_FLUJO: { estado: EstadoOrden; label: string; descripcion: string }[] = [
    { estado: 'pendiente',  label: 'Recibido',    descripcion: 'Tu pedido fue recibido' },
    { estado: 'confirmado', label: 'Confirmado',  descripcion: 'Pago confirmado' },
    { estado: 'preparando', label: 'Preparando',  descripcion: 'Estamos alistando tu pedido' },
    { estado: 'enviado',    label: 'En camino',   descripcion: 'Tu pedido fue despachado' },
    { estado: 'entregado',  label: 'Entregado',   descripcion: '¡Pedido entregado!' },
]

const ORDEN_ESTADO: Record<EstadoOrden, number> = {
    pendiente: 0, confirmado: 1, preparando: 2, enviado: 3, entregado: 4, cancelado: -1,
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

const LABEL_ESTADO: Record<EstadoOrden, string> = {
    pendiente:  'Pedido recibido',
    confirmado: 'Pago confirmado',
    preparando: 'Estamos preparando tu pedido',
    enviado:    'Tu pedido está en camino',
    entregado:  '¡Tu pedido fue entregado!',
    cancelado:  'Pedido cancelado',
}

function OrdenSeguimiento() {
    const { orden: ordenInicial } = usePage<{ orden: OrdenSeguimientoData }>().props
    const [estado,        setEstado]        = useState<EstadoOrden>(ordenInicial.estado)
    const [numeroGuia,    setNumeroGuia]    = useState<string | null>(ordenInicial.numero_guia)
    const [transportadora, setTransportadora] = useState<string | null>(ordenInicial.transportadora)

    useEffect(() => {
        const client = getAblyClient()
        const canal  = client.channels.get(`orders.${ordenInicial.codigo}`)

        function manejarEvento(msg: { data: unknown }) {
            const data = msg.data as { estado: EstadoOrden; numero_guia?: string | null; transportadora?: string | null }
            setEstado(data.estado)
            if (data.numero_guia !== undefined)    setNumeroGuia(data.numero_guia ?? null)
            if (data.transportadora !== undefined) setTransportadora(data.transportadora ?? null)
            toast.info(LABEL_ESTADO[data.estado] ?? 'Estado actualizado')
        }

        canal.subscribe('orden.actualizada', manejarEvento)

        // Re-suscribir tras reconexión (wifi caído, suspend laptop). Sin esto
        // el cliente perdería actualizaciones en silencio cuando vuelva online.
        function onReconectado() {
            canal.subscribe('orden.actualizada', manejarEvento)
        }
        client.connection.on('connected', onReconectado)

        return () => {
            canal.unsubscribe('orden.actualizada', manejarEvento)
            client.connection.off('connected', onReconectado)
        }
    }, [ordenInicial.codigo])

    const cancelado = estado === 'cancelado'
    const pasoActual = ORDEN_ESTADO[estado]

    return (
        <>
            <Head title={`Pedido ${ordenInicial.codigo}`} />

            <section className="bg-slate-50 py-12 min-h-[80vh]">
                <div className="max-w-2xl mx-auto px-4 sm:px-6">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 mb-3">
                            <PackageIcon className="w-5 h-5 text-slate-500" />
                            <span className="font-mono text-lg font-bold text-slate-900">{ordenInicial.codigo}</span>
                        </div>
                        <p className="text-sm text-slate-500">Pedido realizado el {ordenInicial.created_at}</p>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                        {cancelado ? (
                            <div className="text-center py-4">
                                <p className="text-base font-bold text-red-500 mb-1">Pedido cancelado</p>
                                <p className="text-sm text-slate-500">Si tienes preguntas, contáctanos por WhatsApp.</p>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-2">
                                {PASOS_FLUJO.map((paso, i) => {
                                    const completado = pasoActual > i
                                    const actual     = pasoActual === i
                                    return (
                                        <div key={paso.estado} className="flex-1 flex flex-col items-center gap-2 relative">
                                            {/* Línea conectora */}
                                            {i < PASOS_FLUJO.length - 1 && (
                                                <div className={`absolute top-4 left-1/2 w-full h-0.5 ${completado ? 'bg-slate-900' : 'bg-slate-200'}`} />
                                            )}
                                            {/* Círculo */}
                                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                                                completado ? 'bg-slate-900 border-slate-900' :
                                                actual      ? 'bg-white border-slate-900' :
                                                              'bg-white border-slate-200'
                                            }`}>
                                                {completado ? (
                                                    <CheckIcon className="w-4 h-4 text-white" />
                                                ) : (
                                                    <div className={`w-2 h-2 rounded-full ${actual ? 'bg-slate-900' : 'bg-slate-300'}`} />
                                                )}
                                            </div>
                                            {/* Texto */}
                                            <p className={`text-xs font-semibold text-center leading-tight ${
                                                completado || actual ? 'text-slate-900' : 'text-slate-500'
                                            }`}>
                                                {paso.label}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Información de envío */}
                    {estado === 'enviado' && (numeroGuia || transportadora) && (
                        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 mb-6">
                            <h2 className="text-sm font-bold text-slate-900 mb-3">Información de envío</h2>
                            <div className="flex flex-col gap-2">
                                {transportadora && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Transportadora</span>
                                        <span className="font-medium text-slate-900">{transportadora}</span>
                                    </div>
                                )}
                                {numeroGuia && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Número de guía</span>
                                        <span className="font-mono font-bold text-slate-900">{numeroGuia}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Resumen */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">Tu pedido</h2>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {ordenInicial.items.map((item, i) => (
                                <div key={i} className="px-5 py-3 flex items-center gap-3">
                                    {item.imagen && (
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                            <img src={item.imagen} alt={item.nombre} className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{item.nombre}</p>
                                        {item.label && <p className="text-xs text-slate-500">{item.label}</p>}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-slate-900">{formatPrecio(item.precio * item.cantidad)}</p>
                                        <p className="text-xs text-slate-500">x{item.cantidad}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-5 py-4 border-t border-slate-100 flex flex-col gap-1.5">
                            {ordenInicial.costo_envio > 0 && (
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Envío</span><span>{formatPrecio(ordenInicial.costo_envio)}</span>
                                </div>
                            )}
                            {ordenInicial.recargo > 0 && (
                                <div className="flex justify-between text-sm text-amber-600">
                                    <span>Recargo</span><span>{formatPrecio(ordenInicial.recargo)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-slate-900">
                                <span>Total</span><span>{formatPrecio(ordenInicial.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Datos de entrega */}
                    <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 mb-6">
                        <h2 className="text-sm font-bold text-slate-900 mb-2">Entrega en</h2>
                        <p className="text-sm text-slate-600">{ordenInicial.ciudad}, {ordenInicial.departamento}</p>
                    </div>

                    <div className="text-center">
                        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 transition-colors duration-200">
                            ← Volver al inicio
                        </Link>
                    </div>

                </div>
            </section>
        </>
    )
}

OrdenSeguimiento.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default OrdenSeguimiento
