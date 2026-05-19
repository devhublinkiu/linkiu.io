import { type ReactNode, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { ArrowLeftIcon, FileTextIcon, EyeIcon, DownloadIcon, XIcon, XCircleIcon } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Textarea } from '@/Components/ui/Textarea'
import StatusBadge from './parts/StatusBadge'

interface OrderItem {
    id: number
    nombre: string
    imagen: string | null
    label: string | null
    cantidad: number
    precio: number
}

interface Orden {
    id: number
    codigo: string
    estado: string
    metodo_pago: string
    subtotal: number
    costo_envio: number
    recargo: number
    total: number
    nombre: string
    apellido: string
    email: string
    telefono: string
    departamento: string
    ciudad: string
    direccion: string
    apartamento: string | null
    notas: string | null
    notas_internas: string | null
    comprobante_url: string | null
    created_at: string
    items: OrderItem[]
}

const ESTADOS_FLUJO = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado'] as const

const LABEL_FLUJO: Record<string, string> = {
    pendiente:  'Pendiente',
    confirmado: 'Confirmado',
    preparando: 'Preparando',
    enviado:    'Enviado',
    entregado:  'Entregado',
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function OrdenShow() {
    const { orden } = usePage<{ orden: Orden }>().props
    const [notasInternas, setNotasInternas] = useState(orden.notas_internas ?? '')
    const [guardando, setGuardando] = useState(false)
    const [estadoPendiente, setEstadoPendiente] = useState<string | null>(null)
    const [numeroGuia, setNumeroGuia] = useState('')
    const [transportadora, setTransportadora] = useState('')

    function cambiarEstado(nuevoEstado: string) {
        if (nuevoEstado === orden.estado) return
        if (nuevoEstado === 'enviado') {
            setEstadoPendiente('enviado')
            return
        }
        router.post(route('admin.ordenes.estado', orden.id), { estado: nuevoEstado }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Estado actualizado'),
            onError:   () => toast.error('Error al actualizar el estado'),
        })
    }

    function confirmarEnviado() {
        router.post(
            route('admin.ordenes.estado', orden.id),
            { estado: 'enviado', numero_guia: numeroGuia, transportadora },
            {
            preserveScroll: true,
            onSuccess: () => { toast.success('Orden marcada como enviada'); setEstadoPendiente(null); setNumeroGuia(''); setTransportadora('') },
            onError:   () => toast.error('Error al actualizar el estado'),
        }
        )
    }

    function guardarNotas() {
        setGuardando(true)
        router.post(
            route('admin.ordenes.notas-internas', orden.id),
            { notas_internas: notasInternas },
            {
            preserveScroll: true,
            onSuccess: () => toast.success('Notas guardadas'),
            onError:   () => toast.error('Error al guardar las notas'),
            onFinish:  () => setGuardando(false),
        }
        )
    }

    const [verComprobante, setVerComprobante] = useState(false)

    const esComprobante = orden.comprobante_url !== null
    const extensionImg  = orden.comprobante_url?.match(/\.(jpg|jpeg|png|webp)$/i)

    return (
        <>
            <Head title={`Orden ${orden.codigo}`} />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.visit(route('admin.ordenes.index'))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors duration-200"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold text-slate-900 font-mono">{orden.codigo}</h1>
                        <StatusBadge estado={orden.estado as any} />
                    </div>
                    <p className="text-xs text-slate-400">{orden.created_at}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

                {/* Columna principal */}
                <div className="flex flex-col gap-6">

                    {/* Items */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">Productos</h2>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {orden.items.map(item => (
                                <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                                    {item.imagen && (
                                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                            <img src={item.imagen} alt={item.nombre} className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{item.nombre}</p>
                                        {item.label && <p className="text-xs text-slate-400">{item.label}</p>}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-slate-900">{formatPrecio(item.precio * item.cantidad)}</p>
                                        <p className="text-xs text-slate-400">x{item.cantidad} · {formatPrecio(item.precio)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-5 py-4 border-t border-slate-100 flex flex-col gap-1.5">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal</span><span>{formatPrecio(orden.subtotal)}</span>
                            </div>
                            {orden.costo_envio > 0 && (
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Envío</span><span>{formatPrecio(orden.costo_envio)}</span>
                                </div>
                            )}
                            {orden.recargo > 0 && (
                                <div className="flex justify-between text-sm text-amber-600">
                                    <span>Recargo contraentrega</span><span>{formatPrecio(orden.recargo)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100 mt-1">
                                <span>Total</span><span>{formatPrecio(orden.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notas internas */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">Notas internas</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Solo visible para el equipo, no se envía al cliente.</p>
                        </div>
                        <div className="p-5 flex flex-col gap-3">
                            <Textarea
                                value={notasInternas}
                                onChange={e => setNotasInternas(e.target.value)}
                                rows={4}
                                placeholder="Agrega notas sobre este pedido…"
                                className="resize-none"
                            />
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    onClick={guardarNotas}
                                    disabled={guardando}
                                >
                                    {guardando ? 'Guardando…' : 'Guardar notas'}
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Columna lateral */}
                <div className="flex flex-col gap-6">

                    {/* Cambiar estado */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">Estado del pedido</h2>
                        </div>

                        <div className="py-1">
                            {ESTADOS_FLUJO.map(est => {
                                const esActual = orden.estado === est
                                return (
                                    <button
                                        key={est}
                                        onClick={() => cambiarEstado(est)}
                                        disabled={esActual}
                                        className={`flex items-center gap-3 w-full px-5 py-3 text-left transition-colors duration-200 ${
                                            esActual ? 'cursor-default' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                            esActual ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                                        }`}>
                                            {esActual && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                        <span className={`text-sm flex-1 ${esActual ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                                            {LABEL_FLUJO[est]}
                                        </span>
                                        {esActual && (
                                            <span className="text-[10px] font-medium text-slate-400">Actual</span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {orden.estado !== 'cancelado' && (
                            <div className="px-5 pb-5 pt-3 border-t border-slate-100 mt-1">
                                <button
                                    onClick={() => cambiarEstado('cancelado')}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors duration-200"
                                >
                                    <XCircleIcon className="w-3.5 h-3.5" />
                                    Cancelar pedido
                                </button>
                            </div>
                        )}

                        {orden.estado === 'cancelado' && (
                            <div className="px-5 pb-5 pt-3 border-t border-slate-100 mt-1">
                                <p className="text-xs text-center text-red-400 font-medium">Pedido cancelado</p>
                            </div>
                        )}

                        {/* Número de guía al marcar como enviado */}
                        {estadoPendiente === 'enviado' && (
                            <div className="px-5 pb-5 flex flex-col gap-3 border-t border-slate-100 pt-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                        Transportadora <span className="text-slate-400 font-normal">(opcional)</span>
                                    </label>
                                    <Input
                                        value={transportadora}
                                        onChange={e => setTransportadora(e.target.value)}
                                        placeholder="Ej: Servientrega"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                        Número de guía <span className="text-slate-400 font-normal">(opcional)</span>
                                    </label>
                                    <Input
                                        value={numeroGuia}
                                        onChange={e => setNumeroGuia(e.target.value)}
                                        placeholder="Ej: 1234567890"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={confirmarEnviado} className="flex-1">
                                        Confirmar enviado
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setEstadoPendiente(null)}>
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Datos del cliente */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">Cliente</h2>
                        </div>
                        <div className="px-5 py-4 flex flex-col gap-2 text-sm">
                            <p className="font-semibold text-slate-900">{orden.nombre} {orden.apellido}</p>
                            <p className="text-slate-500">{orden.email}</p>
                            <p className="text-slate-500">{orden.telefono}</p>
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">Dirección de entrega</h2>
                        </div>
                        <div className="px-5 py-4 flex flex-col gap-1 text-sm text-slate-600">
                            <p>{orden.direccion}{orden.apartamento ? ` · ${orden.apartamento}` : ''}</p>
                            <p>{orden.ciudad}, {orden.departamento}</p>
                            {orden.notas && (
                                <p className="text-slate-400 text-xs mt-1 italic">"{orden.notas}"</p>
                            )}
                        </div>
                    </div>

                    {/* Método de pago */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">Método de pago</h2>
                        </div>
                        <div className="px-5 py-4 flex flex-col gap-3">
                            <p className="text-sm font-medium text-slate-900 capitalize">{orden.metodo_pago.replace('_', ' ')}</p>
                            {esComprobante && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setVerComprobante(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors duration-200"
                                    >
                                        <EyeIcon className="w-3.5 h-3.5" />
                                        Ver
                                    </button>
                                    <a
                                        href={orden.comprobante_url!}
                                        download
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors duration-200"
                                    >
                                        <DownloadIcon className="w-3.5 h-3.5" />
                                        Descargar
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Modal comprobante */}
            {verComprobante && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
                    onClick={() => setVerComprobante(false)}
                >
                    <div
                        className="relative bg-white rounded-2xl overflow-hidden w-full max-w-md"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <p className="text-sm font-semibold text-slate-900">Comprobante de pago</p>
                            <div className="flex items-center gap-3">
                                <a
                                    href={orden.comprobante_url!}
                                    download
                                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors duration-200"
                                >
                                    <DownloadIcon className="w-3.5 h-3.5" />
                                    Descargar
                                </a>
                                <button
                                    onClick={() => setVerComprobante(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-200"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-center">
                            {extensionImg ? (
                                <img
                                    src={orden.comprobante_url!}
                                    alt="Comprobante"
                                    className="max-h-[70vh] max-w-full rounded-lg object-contain"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-8 text-center">
                                    <FileTextIcon className="w-10 h-10 text-slate-300" />
                                    <p className="text-sm text-slate-600 font-medium">Comprobante PDF</p>
                                    <a
                                        href={orden.comprobante_url!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-slate-400 hover:text-slate-700 transition-colors duration-200"
                                    >
                                        Abrir en nueva pestaña →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

OrdenShow.layout = (page: ReactNode) => {
    const { orden } = (page as any).props
    return (
        <AdminLayout breadcrumbs={[
            { label: 'Panel', href: route('admin.dashboard') },
            { label: 'Órdenes', href: route('admin.ordenes.index') },
            { label: orden.codigo },
        ]}>
            {page}
        </AdminLayout>
    )
}

export default OrdenShow
