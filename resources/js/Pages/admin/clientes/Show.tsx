import { type ReactNode, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { Users, MessageCircle, Mail, CheckIcon, XIcon, ShoppingBag, Package } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/Layouts/AdminLayout'
import { Input } from '@/Components/ui/Input'
import { Textarea } from '@/Components/ui/Textarea'
import StatusBadge from '../ordenes/parts/StatusBadge'

interface ProductoTop {
    nombre: string
    imagen: string | null
    cantidad: number
}

interface ClienteDetalle {
    id: number
    nombre: string
    apellido: string
    email: string
    telefono: string
    tiene_cuenta: boolean
    created_at: string
    total_ordenes: number
    total_gastado: number
    producto_top: ProductoTop | null
}

interface OrdenResumen {
    id: number
    codigo: string
    estado: string
    total: number
    metodo_pago: string
    created_at: string
}

interface Props {
    cliente: ClienteDetalle
    ordenes: OrdenResumen[]
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function ClienteShow() {
    const { cliente: clienteInicial, ordenes } = usePage<Props>().props

    const [editando, setEditando]   = useState(false)
    const [nombre, setNombre]       = useState(clienteInicial.nombre)
    const [apellido, setApellido]   = useState(clienteInicial.apellido)
    const [telefono, setTelefono]   = useState(clienteInicial.telefono)
    const [guardando, setGuardando] = useState(false)

    const [modalEmail, setModalEmail]       = useState(false)
    const [asunto, setAsunto]               = useState('')
    const [mensaje, setMensaje]             = useState('')
    const [enviandoEmail, setEnviandoEmail] = useState(false)

    function guardarPerfil() {
        if (!nombre.trim() || !apellido.trim() || !telefono.trim()) {
            toast.error('Completa todos los campos')
            return
        }
        setGuardando(true)
        router.post(route('admin.clientes.update', clienteInicial.id), { nombre, apellido, telefono }, {
            preserveState: true,
            onSuccess: () => { setEditando(false); toast.success('Perfil actualizado') },
            onError: () => toast.error('Error al guardar'),
            onFinish: () => setGuardando(false),
        })
    }

    function cancelarEdicion() {
        setNombre(clienteInicial.nombre)
        setApellido(clienteInicial.apellido)
        setTelefono(clienteInicial.telefono)
        setEditando(false)
    }

    function enviarEmail() {
        if (!asunto.trim() || !mensaje.trim()) {
            toast.error('Completa asunto y mensaje')
            return
        }
        setEnviandoEmail(true)
        router.post(route('admin.clientes.email', clienteInicial.id), { asunto, mensaje }, {
            preserveState: true,
            onSuccess: () => { setModalEmail(false); setAsunto(''); setMensaje(''); toast.success('Email enviado') },
            onError: () => toast.error('Error al enviar el email'),
            onFinish: () => setEnviandoEmail(false),
        })
    }

    return (
        <>
            <Head title={`${clienteInicial.nombre} ${clienteInicial.apellido}`} />

            <div className="flex flex-col gap-6">

                {/* Header */}
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-base font-bold text-slate-900">{clienteInicial.nombre} {clienteInicial.apellido}</h1>
                                {clienteInicial.tiene_cuenta ? (
                                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-700">Con cuenta</span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 text-amber-700">Invitado</span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{clienteInicial.email} · {clienteInicial.telefono}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={`https://wa.me/57${clienteInicial.telefono.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                        >
                            <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                            WhatsApp
                        </a>
                        <button
                            onClick={() => setModalEmail(true)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                        >
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            Email
                        </button>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                        <p className="text-xs text-slate-400 mb-1">Pedidos</p>
                        <p className="text-2xl font-bold text-slate-900">{clienteInicial.total_ordenes}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                        <p className="text-xs text-slate-400 mb-1">Total gastado</p>
                        <p className="text-2xl font-bold text-slate-900">{formatPrecio(clienteInicial.total_gastado)}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                        <p className="text-xs text-slate-400 mb-2">Producto más comprado</p>
                        {clienteInicial.producto_top ? (
                            <div className="flex items-center gap-2">
                                {clienteInicial.producto_top.imagen ? (
                                    <img
                                        src={clienteInicial.producto_top.imagen}
                                        alt={clienteInicial.producto_top.nombre}
                                        className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                        <Package className="w-4 h-4 text-slate-400" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 truncate">{clienteInicial.producto_top.nombre}</p>
                                    <p className="text-[11px] text-slate-400">{clienteInicial.producto_top.cantidad} unid.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-slate-300" />
                                <p className="text-xs text-slate-400">Sin pedidos</p>
                            </div>
                        )}
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                        <p className="text-xs text-slate-400 mb-1">Cliente desde</p>
                        <p className="text-sm font-bold text-slate-900">{clienteInicial.created_at}</p>
                    </div>
                </div>

                {/* Perfil editable */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <span className="text-sm font-semibold text-slate-900">Información personal</span>
                        {!editando ? (
                            <button onClick={() => setEditando(true)} className="text-xs text-slate-500 hover:text-slate-800 transition-colors duration-200">
                                Editar
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button onClick={cancelarEdicion} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors duration-200">
                                    <XIcon className="w-3.5 h-3.5" /> Cancelar
                                </button>
                                <button onClick={guardarPerfil} disabled={guardando}
                                    className="flex items-center gap-1 text-xs font-medium text-white bg-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50">
                                    <CheckIcon className="w-3.5 h-3.5" />
                                    {guardando ? 'Guardando…' : 'Guardar'}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Nombre</p>
                            {editando ? <Input value={nombre} onChange={e => setNombre(e.target.value)} /> : <p className="text-sm font-medium text-slate-900">{nombre}</p>}
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Apellido</p>
                            {editando ? <Input value={apellido} onChange={e => setApellido(e.target.value)} /> : <p className="text-sm font-medium text-slate-900">{apellido}</p>}
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Email</p>
                            <p className="text-sm text-slate-600">{clienteInicial.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Teléfono</p>
                            {editando ? <Input value={telefono} onChange={e => setTelefono(e.target.value)} /> : <p className="text-sm font-medium text-slate-900">{telefono}</p>}
                        </div>
                    </div>
                </div>

                {/* Historial de pedidos */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <span className="text-sm font-semibold text-slate-900">Historial de pedidos</span>
                        <span className="text-xs text-slate-400">{ordenes.length} pedido{ordenes.length !== 1 ? 's' : ''}</span>
                    </div>
                    {ordenes.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="text-sm text-slate-400">Sin pedidos aún.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Código</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Estado</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Pago</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {ordenes.map(orden => (
                                    <tr key={orden.id} className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                                        onClick={() => router.visit(route('admin.ordenes.show', orden.id))}>
                                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">{orden.codigo}</td>
                                        <td className="px-4 py-3"><StatusBadge estado={orden.estado as any} /></td>
                                        <td className="px-4 py-3 text-xs text-slate-600 capitalize hidden md:table-cell">{orden.metodo_pago.replace('_', ' ')}</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-900">{formatPrecio(orden.total)}</td>
                                        <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">{orden.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal email */}
            {modalEmail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModalEmail(false)}>
                    <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <span className="text-sm font-semibold text-slate-900">Email a {clienteInicial.nombre}</span>
                            <button onClick={() => setModalEmail(false)} className="text-slate-400 hover:text-slate-600 transition-colors duration-200">
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-5 py-4 flex flex-col gap-3">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Asunto</p>
                                <Input value={asunto} onChange={e => setAsunto(e.target.value)} placeholder="Asunto del email" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Mensaje</p>
                                <Textarea value={mensaje} onChange={e => setMensaje(e.target.value)} placeholder="Escribe tu mensaje…" rows={6} className="resize-none" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
                            <button onClick={() => setModalEmail(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors duration-200">Cancelar</button>
                            <button onClick={enviarEmail} disabled={enviandoEmail}
                                className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50">
                                {enviandoEmail ? 'Enviando…' : 'Enviar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

ClienteShow.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Clientes', href: route('admin.clientes.index') },
        { label: 'Detalle' },
    ]}>{page}</AdminLayout>
)

export default ClienteShow
