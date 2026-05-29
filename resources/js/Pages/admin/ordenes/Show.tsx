import { type ReactNode, useEffect, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { ArrowLeftIcon, FileTextIcon, EyeIcon, DownloadIcon, XCircleIcon, ShieldAlert, CheckCircle2 } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Textarea } from '@/Components/ui/Textarea'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/Components/ui/AlertDialog'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/Components/ui/Dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import StatusBadge, { type Estado } from './parts/StatusBadge'
import MotivoRevisionBadge from './parts/MotivoRevisionBadge'
import ConfirmacionCodBadge, { calcularEstadoConfirmacion } from './parts/ConfirmacionCodBadge'

type RevisionEstado = 'pendiente' | 'aprobada' | 'rechazada' | null
type RespuestaCod   = 'si' | 'no' | null

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
    estado: Estado
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
    revision_estado:      RevisionEstado
    revision_motivos:     string[] | null
    revision_revisada_at: string | null
    revision_comentario:  string | null
    confirmacion_solicitada_at:  string | null
    confirmacion_reenviada:      boolean
    confirmacion_respondida_at:  string | null
    confirmacion_respuesta:      RespuestaCod
}

// 'preparando' oculto del UI (Capa 3) — la transición confirmado -> enviado es directa.
const ESTADOS_FLUJO = ['pendiente', 'confirmado', 'enviado', 'entregado'] as const

const LABEL_FLUJO: Record<string, string> = {
    pendiente:  'Pendiente',
    confirmado: 'Confirmado',
    enviado:    'Enviado',
    entregado:  'Entregado',
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

interface SharedProps {
    orden: Orden
    flash: { status?: string }
}

function OrdenShow() {
    const { orden, flash } = usePage<SharedProps>().props
    const [notasInternas, setNotasInternas] = useState(orden.notas_internas ?? '')
    const [guardando, setGuardando] = useState(false)
    const [estadoPendiente, setEstadoPendiente] = useState<string | null>(null)
    const [numeroGuia, setNumeroGuia] = useState('')
    const [transportadora, setTransportadora] = useState('')

    useEffect(() => {
        if (flash?.status) toast.success(flash.status)
    }, [flash?.status])

    const [confirmarCancelar, setConfirmarCancelar] = useState(false)
    const [motivoCancelacion, setMotivoCancelacion] = useState('')

    // Antifraude
    const enRevision = orden.revision_estado === 'pendiente'
    const [confirmarRechazo, setConfirmarRechazo] = useState(false)
    const [comentarioRechazo, setComentarioRechazo] = useState('')
    const [procesandoRevision, setProcesandoRevision] = useState(false)

    function aprobarRevision() {
        setProcesandoRevision(true)
        router.post(route('admin.ordenes.revision.aprobar', orden.id), {}, {
            preserveScroll: true,
            onError:  () => toast.error('Error al aprobar la orden'),
            onFinish: () => setProcesandoRevision(false),
        })
    }

    function ejecutarRechazo() {
        if (! comentarioRechazo.trim()) return
        setProcesandoRevision(true)
        router.post(
            route('admin.ordenes.revision.rechazar', orden.id),
            { comentario: comentarioRechazo.trim() },
            {
                preserveScroll: true,
                onSuccess: () => { setConfirmarRechazo(false); setComentarioRechazo('') },
                onError:   () => toast.error('Error al rechazar la orden'),
                onFinish:  () => setProcesandoRevision(false),
            },
        )
    }

    function cambiarEstado(nuevoEstado: string) {
        if (enRevision) {
            toast.error('Aprobá la revisión antifraude primero.')
            return
        }
        if (nuevoEstado === orden.estado) return
        if (nuevoEstado === 'enviado') {
            setEstadoPendiente('enviado')
            return
        }
        if (nuevoEstado === 'cancelado') {
            setMotivoCancelacion('')
            setConfirmarCancelar(true)
            return
        }
        router.post(route('admin.ordenes.estado', orden.id), { estado: nuevoEstado }, {
            preserveScroll: true,
            onError: () => toast.error('Error al actualizar el estado'),
        })
    }

    function confirmarCancelacion() {
        router.post(
            route('admin.ordenes.estado', orden.id),
            { estado: 'cancelado', motivo_cancelacion: motivoCancelacion || null },
            {
                preserveScroll: true,
                onSuccess: () => setConfirmarCancelar(false),
                onError:   () => { toast.error('Error al cancelar el pedido'); setConfirmarCancelar(false) },
            },
        )
    }

    function confirmarEnviado() {
        router.post(
            route('admin.ordenes.estado', orden.id),
            { estado: 'enviado', numero_guia: numeroGuia, transportadora },
            {
                preserveScroll: true,
                onSuccess: () => { setEstadoPendiente(null); setNumeroGuia(''); setTransportadora('') },
                onError:   () => toast.error('Error al actualizar el estado'),
            },
        )
    }

    function guardarNotas() {
        setGuardando(true)
        router.post(
            route('admin.ordenes.notas-internas', orden.id),
            { notas_internas: notasInternas },
            {
                preserveScroll: true,
                onError:   () => toast.error('Error al guardar las notas'),
                onFinish:  () => setGuardando(false),
            },
        )
    }

    const [verComprobante, setVerComprobante] = useState(false)

    const esComprobante = orden.comprobante_url !== null
    const extensionImg  = orden.comprobante_url?.match(/\.(jpg|jpeg|png|webp)$/i)

    return (
        <TooltipProvider>
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
                        <StatusBadge estado={orden.estado} />
                    </div>
                    <p className="text-xs text-slate-500">{orden.created_at}</p>
                </div>
            </div>

            {/* Card revisión antifraude — solo cuando está bloqueada. Va arriba
                de todo el grid para destacarlo. */}
            {enRevision && (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <ShieldAlert className="w-4 h-4 text-amber-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-bold text-amber-800">Orden bajo revisión antifraude</h2>
                            <p className="text-xs text-amber-700 mt-0.5">
                                No se puede procesar hasta que la apruebes o rechaces.
                            </p>

                            {orden.revision_motivos && orden.revision_motivos.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {orden.revision_motivos.map(m => (
                                        <MotivoRevisionBadge key={m} motivo={m} className="bg-white" />
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-4">
                                <Button
                                    size="sm"
                                    onClick={aprobarRevision}
                                    disabled={procesandoRevision}
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                    Aprobar y desbloquear
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setConfirmarRechazo(true)}
                                    disabled={procesandoRevision}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <XCircleIcon className="w-3.5 h-3.5 mr-1" />
                                    Rechazar y cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Aviso de auditoría cuando ya fue revisada */}
            {(orden.revision_estado === 'aprobada' || orden.revision_estado === 'rechazada') && orden.revision_revisada_at && (
                <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
                    {orden.revision_estado === 'aprobada' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                        <XCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <p className="text-xs text-slate-600">
                        Revisión <strong className="text-slate-900">{orden.revision_estado}</strong> el {orden.revision_revisada_at}
                        {orden.revision_comentario && <> — <span className="italic">"{orden.revision_comentario}"</span></>}
                    </p>
                </div>
            )}

            {/* Estado de confirmación COD del cliente vía WhatsApp */}
            {(() => {
                const ec = calcularEstadoConfirmacion(orden)
                if (!ec) return null
                return (
                    <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
                        <ConfirmacionCodBadge estado={ec} />
                        {orden.confirmacion_respondida_at && (
                            <p className="text-xs text-slate-600">
                                el {orden.confirmacion_respondida_at}
                            </p>
                        )}
                    </div>
                )
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

                {/* Columna principal */}
                <div className="flex flex-col gap-6">

                    {/* Items */}
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
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
                                        {item.label && <p className="text-xs text-slate-500">{item.label}</p>}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-slate-900">{formatPrecio(item.precio * item.cantidad)}</p>
                                        <p className="text-xs text-slate-500">x{item.cantidad} · {formatPrecio(item.precio)}</p>
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
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">Notas internas</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Solo visible para el equipo, no se envía al cliente.</p>
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
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">Estado del pedido</h2>
                        </div>

                        <div className="py-1">
                            {ESTADOS_FLUJO.map(est => {
                                const esActual = orden.estado === est
                                const boton = (
                                    <button
                                        key={est}
                                        onClick={() => cambiarEstado(est)}
                                        disabled={esActual || enRevision}
                                        className={`flex items-center gap-3 w-full px-5 py-3 text-left transition-colors duration-200 ${
                                            esActual ? 'cursor-default' : enRevision ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-50'
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
                                            <span className="text-xs font-medium text-slate-500">Actual</span>
                                        )}
                                    </button>
                                )

                                if (enRevision && !esActual) {
                                    return (
                                        <Tooltip key={est}>
                                            <TooltipTrigger asChild><span className="block">{boton}</span></TooltipTrigger>
                                            <TooltipContent>Aprobá la revisión antifraude primero</TooltipContent>
                                        </Tooltip>
                                    )
                                }

                                return boton
                            })}
                        </div>

                        {orden.estado !== 'cancelado' && orden.estado !== 'devuelto' && !enRevision && (
                            <div className="px-5 pb-5 pt-3 border-t border-slate-100 mt-1 flex flex-col gap-2">
                                <button
                                    onClick={() => cambiarEstado('cancelado')}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors duration-200"
                                >
                                    <XCircleIcon className="w-3.5 h-3.5" />
                                    Cancelar pedido
                                </button>
                                {(orden.estado === 'enviado' || orden.estado === 'entregado') && (
                                    <button
                                        onClick={() => cambiarEstado('devuelto')}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors duration-200"
                                    >
                                        <XCircleIcon className="w-3.5 h-3.5" />
                                        Marcar como devuelto
                                    </button>
                                )}
                            </div>
                        )}

                        {orden.estado === 'devuelto' && (
                            <div className="px-5 pb-5 pt-3 border-t border-slate-100 mt-1">
                                <p className="text-xs text-center text-red-400 font-medium">Pedido devuelto</p>
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
                                        Transportadora <span className="text-slate-500 font-normal">(opcional)</span>
                                    </label>
                                    <Input
                                        value={transportadora}
                                        onChange={e => setTransportadora(e.target.value)}
                                        placeholder="Ej: Servientrega"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                        Número de guía <span className="text-slate-500 font-normal">(opcional)</span>
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
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
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
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-900">Dirección de entrega</h2>
                        </div>
                        <div className="px-5 py-4 flex flex-col gap-1 text-sm text-slate-600">
                            <p>{orden.direccion}{orden.apartamento ? ` · ${orden.apartamento}` : ''}</p>
                            <p>{orden.ciudad}, {orden.departamento}</p>
                            {orden.notas && (
                                <p className="text-slate-500 text-xs mt-1 italic">"{orden.notas}"</p>
                            )}
                        </div>
                    </div>

                    {/* Método de pago */}
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
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

            {/* AlertDialog cancelar pedido */}
            <AlertDialog open={confirmarCancelar} onOpenChange={setConfirmarCancelar}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cancelar el pedido {orden.codigo}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción es irreversible y notificará al cliente {orden.nombre} {orden.apellido} por correo y WhatsApp.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-1.5 px-1">
                        <label htmlFor="motivo-cancelacion" className="text-xs font-medium text-slate-600">
                            Motivo <span className="text-slate-500 font-normal">(opcional, se incluye en la notificación al cliente)</span>
                        </label>
                        <Textarea
                            id="motivo-cancelacion"
                            value={motivoCancelacion}
                            onChange={e => setMotivoCancelacion(e.target.value)}
                            maxLength={500}
                            rows={3}
                            placeholder="Ej: producto sin stock, dirección fuera de cobertura…"
                            className="resize-none"
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Volver</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={confirmarCancelacion}>
                            Sí, cancelar pedido
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Modal comprobante */}
            <Dialog open={verComprobante} onOpenChange={setVerComprobante}>
                <DialogContent className="max-w-md p-0">
                    <DialogHeader className="px-4 py-3 pr-12 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-3">
                            <DialogTitle className="text-sm font-semibold text-slate-900">
                                Comprobante de pago
                            </DialogTitle>
                            <a
                                href={orden.comprobante_url!}
                                download
                                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors duration-200 shrink-0"
                            >
                                <DownloadIcon className="w-3.5 h-3.5" />
                                Descargar
                            </a>
                        </div>
                    </DialogHeader>
                    <div className="p-4 flex items-center justify-center">
                        {extensionImg ? (
                            <img
                                src={orden.comprobante_url!}
                                alt="Comprobante"
                                className="max-h-[70vh] max-w-full rounded-lg object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-8 text-center">
                                <FileTextIcon className="w-8 h-8 text-slate-300" />
                                <p className="text-sm text-slate-600 font-medium">Comprobante PDF</p>
                                <a
                                    href={orden.comprobante_url!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors duration-200"
                                >
                                    Abrir en nueva pestaña →
                                </a>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* AlertDialog rechazo de revisión antifraude */}
            <AlertDialog open={confirmarRechazo} onOpenChange={v => { setConfirmarRechazo(v); if (! v) setComentarioRechazo('') }}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Rechazar la orden {orden.codigo}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La orden se cancelará y se notificará al cliente por correo y WhatsApp.
                            Esta acción no es reversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-1.5 px-1">
                        <label htmlFor="motivo-rechazo" className="text-xs font-medium text-slate-600">
                            Motivo <span className="text-red-600">*</span>
                            <span className="text-slate-500 font-normal"> (queda en el historial y se incluye en la cancelación)</span>
                        </label>
                        <Textarea
                            id="motivo-rechazo"
                            value={comentarioRechazo}
                            onChange={e => setComentarioRechazo(e.target.value)}
                            maxLength={500}
                            rows={3}
                            placeholder="Ej: teléfono inválido y no contesta…"
                            className="resize-none"
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={procesandoRevision}>Volver</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={ejecutarRechazo}
                            disabled={procesandoRevision || ! comentarioRechazo.trim()}
                        >
                            Sí, rechazar y cancelar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TooltipProvider>
    )
}

OrdenShow.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Órdenes', href: route('admin.ordenes.index') },
        { label: 'Detalle' },
    ]}>
        {page}
    </AdminLayout>
)

export default OrdenShow
