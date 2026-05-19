import { type ReactNode, useState } from 'react'
import { Head, router, Link, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { CreditCard, Truck, AlertCircle, Landmark } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Switch } from '@/Components/ui/Switch'
import { Badge } from '@/Components/ui/Badge'
import { Input } from '@/Components/ui/Input'
import { Button } from '@/Components/ui/Button'
import { Textarea } from '@/Components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/Select'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/Components/ui/InputGroup'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'

interface MetodoPago {
    id:          number
    clave:       string
    nombre:      string
    descripcion: string
    activo:      boolean
    orden:       number
    config:      Record<string, unknown> | null
}

interface Props {
    metodos:        MetodoPago[]
    mp_configurado: boolean
    mp_sandbox:     boolean
}

function toggleMetodo(metodo: MetodoPago) {
    router.post(route('admin.metodos-pago.toggle', metodo.id), {}, {
        preserveScroll: true,
        onSuccess: () => toast.success(metodo.activo ? 'Método desactivado' : 'Método activado'),
        onError:   (errors) => toast.error(Object.values(errors)[0] as string),
    })
}

function SwitchConPermiso({ checked, disabled, onCheckedChange, puedeEditar }: {
    checked: boolean
    disabled?: boolean
    onCheckedChange: () => void
    puedeEditar: boolean
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span>
                    <Switch
                        checked={checked}
                        disabled={disabled || !puedeEditar}
                        onCheckedChange={onCheckedChange}
                    />
                </span>
            </TooltipTrigger>
            {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
        </Tooltip>
    )
}

function CardMercadoPago({ metodo, mp_configurado, mp_sandbox, puedeEditar }: {
    metodo: MetodoPago
    mp_configurado: boolean
    mp_sandbox: boolean
    puedeEditar: boolean
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4.5 h-4.5 text-slate-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h3 className="text-sm font-semibold text-slate-900">{metodo.nombre}</h3>
                            {mp_configurado && (
                                <Badge variant={mp_sandbox ? 'secondary' : 'default'}>
                                    {mp_sandbox ? 'Sandbox' : 'Producción'}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{metodo.descripcion}</p>
                    </div>
                </div>
                <SwitchConPermiso
                    checked={metodo.activo}
                    disabled={!mp_configurado}
                    onCheckedChange={() => toggleMetodo(metodo)}
                    puedeEditar={puedeEditar}
                />
            </div>

            {!mp_configurado && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500">
                        Configura las credenciales antes de activar este método.{' '}
                        <Link
                            href={route('admin.integraciones.pasarelas')}
                            className="font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors duration-200"
                        >
                            Ir a Integraciones → Pasarelas de pago
                        </Link>
                    </p>
                </div>
            )}

            {mp_configurado && mp_sandbox && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                        Estás en modo sandbox — los pagos son simulados y no reales.{' '}
                        <Link
                            href={route('admin.integraciones.pasarelas')}
                            className="font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2 transition-colors duration-200"
                        >
                            Cambiar a producción
                        </Link>
                    </p>
                </div>
            )}
        </div>
    )
}

function CardContraentrega({ metodo, puedeEditar }: { metodo: MetodoPago; puedeEditar: boolean }) {
    const [recargo, setRecargo] = useState<string>(
        metodo.config?.recargo != null ? String(metodo.config.recargo) : ''
    )
    const [guardando, setGuardando] = useState(false)

    function guardarConfig() {
        setGuardando(true)
        router.post(route('admin.metodos-pago.config', metodo.id), {
            config: { recargo: recargo !== '' ? parseInt(recargo) : null },
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Configuración guardada'),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <Truck className="w-4.5 h-4.5 text-slate-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">{metodo.nombre}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{metodo.descripcion}</p>
                    </div>
                </div>
                <SwitchConPermiso
                    checked={metodo.activo}
                    onCheckedChange={() => toggleMetodo(metodo)}
                    puedeEditar={puedeEditar}
                />
            </div>

            <div className="pt-1 border-t border-slate-100 space-y-3">
                <div className="space-y-1.5">
                    <label htmlFor="recargo" className="text-xs font-medium text-slate-700">
                        Recargo <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <InputGroup>
                        <InputGroupAddon>$</InputGroupAddon>
                        <InputGroupInput
                            id="recargo"
                            type="text"
                            inputMode="numeric"
                            value={recargo}
                            onChange={e => setRecargo(e.target.value.replace(/\D/g, ''))}
                            placeholder="0"
                            disabled={!puedeEditar}
                            className="text-sm"
                        />
                    </InputGroup>
                    <p className="text-[11px] text-slate-400">
                        Costo adicional visible al cliente al seleccionar contraentrega. Déjalo en 0 si no aplica.
                    </p>
                </div>
                <div className="flex justify-end">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button size="sm" onClick={guardarConfig} disabled={guardando || !puedeEditar}>
                                    {guardando ? 'Guardando…' : 'Guardar'}
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                    </Tooltip>
                </div>
            </div>
        </div>
    )
}

function CardTransferencia({ metodo, puedeEditar }: { metodo: MetodoPago; puedeEditar: boolean }) {
    const cfg = (metodo.config ?? {}) as Record<string, unknown>

    const [banco,                setBanco]                = useState<string>(String(cfg.banco                ?? ''))
    const [tipoCuenta,           setTipoCuenta]           = useState<string>(String(cfg.tipo_cuenta          ?? ''))
    const [numeroCuenta,         setNumeroCuenta]         = useState<string>(String(cfg.numero_cuenta        ?? ''))
    const [titular,              setTitular]              = useState<string>(String(cfg.titular              ?? ''))
    const [tipoDoc,              setTipoDoc]              = useState<string>(String(cfg.tipo_doc             ?? ''))
    const [numeroDoc,            setNumeroDoc]            = useState<string>(String(cfg.numero_doc           ?? ''))
    const [instrucciones,        setInstrucciones]        = useState<string>(String(cfg.instrucciones        ?? ''))
    const [comprobanteRequerido, setComprobanteRequerido] = useState<boolean>(cfg.comprobante_requerido !== false)
    const [guardando,            setGuardando]            = useState(false)

    function guardarConfig() {
        setGuardando(true)
        router.post(route('admin.metodos-pago.config', metodo.id), {
            config: {
                banco:                 banco         || null,
                tipo_cuenta:           tipoCuenta    || null,
                numero_cuenta:         numeroCuenta  || null,
                titular:               titular       || null,
                tipo_doc:              tipoDoc       || null,
                numero_doc:            numeroDoc     || null,
                instrucciones:         instrucciones || null,
                comprobante_requerido: comprobanteRequerido,
            },
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Configuración guardada'),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <Landmark className="w-4.5 h-4.5 text-slate-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">{metodo.nombre}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{metodo.descripcion}</p>
                    </div>
                </div>
                <SwitchConPermiso
                    checked={metodo.activo}
                    onCheckedChange={() => toggleMetodo(metodo)}
                    puedeEditar={puedeEditar}
                />
            </div>

            <div className="pt-1 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Banco</label>
                        <Input
                            type="text"
                            value={banco}
                            onChange={e => setBanco(e.target.value)}
                            placeholder="Ej. Bancolombia"
                            disabled={!puedeEditar}
                            className="text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Tipo de cuenta</label>
                        <Select value={tipoCuenta} onValueChange={setTipoCuenta} disabled={!puedeEditar}>
                            <SelectTrigger className="w-full text-sm">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ahorros">Ahorros</SelectItem>
                                <SelectItem value="corriente">Corriente</SelectItem>
                                <SelectItem value="bre-b">Bre-B</SelectItem>
                                <SelectItem value="billetera-virtual">Billetera virtual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Número de cuenta</label>
                        <Input
                            type="text"
                            value={numeroCuenta}
                            onChange={e => setNumeroCuenta(e.target.value)}
                            placeholder="000-000000-00"
                            disabled={!puedeEditar}
                            className="text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Titular</label>
                        <Input
                            type="text"
                            value={titular}
                            onChange={e => setTitular(e.target.value)}
                            placeholder="Nombre completo"
                            disabled={!puedeEditar}
                            className="text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Tipo de documento</label>
                        <Select value={tipoDoc} onValueChange={setTipoDoc} disabled={!puedeEditar}>
                            <SelectTrigger className="w-full text-sm">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CC">Cédula de ciudadanía</SelectItem>
                                <SelectItem value="NIT">NIT</SelectItem>
                                <SelectItem value="CE">Cédula de extranjería</SelectItem>
                                <SelectItem value="PA">Pasaporte</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">Número de documento</label>
                        <Input
                            type="text"
                            value={numeroDoc}
                            onChange={e => setNumeroDoc(e.target.value)}
                            placeholder="123456789"
                            disabled={!puedeEditar}
                            className="text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Instrucciones <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <Textarea
                        value={instrucciones}
                        onChange={e => setInstrucciones(e.target.value)}
                        placeholder="Ej. Realiza la transferencia y envía el comprobante al WhatsApp 300..."
                        disabled={!puedeEditar}
                        className="text-sm resize-none"
                        rows={3}
                    />
                    <p className="text-[11px] text-slate-400">
                        Texto visible al cliente al seleccionar este método en el checkout.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-4 py-1 border-t border-slate-100">
                    <div>
                        <p className="text-xs font-medium text-slate-700">Requerir comprobante</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">El cliente debe subir el comprobante de pago para confirmar el pedido.</p>
                    </div>
                    <SwitchConPermiso
                        checked={comprobanteRequerido}
                        onCheckedChange={() => setComprobanteRequerido(v => !v)}
                        puedeEditar={puedeEditar}
                    />
                </div>

                <div className="flex justify-end">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button size="sm" onClick={guardarConfig} disabled={guardando || !puedeEditar}>
                                    {guardando ? 'Guardando…' : 'Guardar'}
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                    </Tooltip>
                </div>
            </div>
        </div>
    )
}

export default function MetodosPago({ metodos, mp_configurado, mp_sandbox }: Props) {
    const { props } = usePage<{ auth: { permissions: string[] } }>()
    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)

    const mp            = metodos.find(m => m.clave === 'mercadopago')
    const contraentrega = metodos.find(m => m.clave === 'contraentrega')
    const transferencia = metodos.find(m => m.clave === 'transferencia')

    return (
        <>
            <Head title="Métodos de pago" />

            <TooltipProvider>
                <div className="space-y-6">

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">Métodos de pago</h1>
                            <p className="text-xs text-slate-500">Activa los métodos que verán tus clientes en el checkout.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {mp && (
                            <CardMercadoPago
                                metodo={mp}
                                mp_configurado={mp_configurado}
                                mp_sandbox={mp_sandbox}
                                puedeEditar={puede('metodos-pago.editar')}
                            />
                        )}
                        {contraentrega && (
                            <CardContraentrega metodo={contraentrega} puedeEditar={puede('metodos-pago.editar')} />
                        )}
                    </div>

                    {transferencia && (
                        <CardTransferencia metodo={transferencia} puedeEditar={puede('metodos-pago.editar')} />
                    )}

                </div>
            </TooltipProvider>
        </>
    )
}

MetodosPago.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Métodos de pago' },
    ]}>{page}</AdminLayout>
)
