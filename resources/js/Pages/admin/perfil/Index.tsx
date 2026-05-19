import { useState, useEffect, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { Store, User, KeyRound, Phone } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'

interface Props {
    nombre:          string
    email:           string
    tienda_telefono: string | null
}

interface SharedProps {
    auth: { permissions: string[] }
    flash: { status?: string }
}

export default function PerfilIndex({ nombre, email, tienda_telefono }: Props) {
    const { props } = usePage<SharedProps>()
    const puede = (p: string) => props.auth.permissions.includes('*') || props.auth.permissions.includes(p)
    const puedeEditar       = puede('perfil.editar')
    const puedeEditarTienda = puede('perfil.editar-tienda')

    const [personal, setPersonal] = useState({ name: nombre })
    const [pass, setPass]         = useState({ password_actual: '', password: '', password_confirmation: '' })
    const [errPass, setErrPass]   = useState<string | null>(null)
    const [guardandoPersonal, setGuardandoPersonal] = useState(false)

    const [tienda, setTienda]                     = useState({ tienda_telefono: tienda_telefono ?? '' })
    const [guardandoTienda, setGuardandoTienda]   = useState(false)

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    function guardarPersonal() {
        setErrPass(null)
        setGuardandoPersonal(true)
        router.post(route('admin.perfil.personal'), { ...personal, ...pass }, {
            preserveScroll: true,
            onSuccess: () => setPass({ password_actual: '', password: '', password_confirmation: '' }),
            onError: (errors) => {
                if (errors.password_actual) setErrPass(errors.password_actual)
                else toast.error('Error al guardar los datos personales')
            },
            onFinish: () => setGuardandoPersonal(false),
        })
    }

    function guardarTienda() {
        setGuardandoTienda(true)
        router.post(route('admin.perfil.tienda'), tienda, {
            preserveScroll: true,
            onError: () => toast.error('Error al guardar los datos de la tienda'),
            onFinish: () => setGuardandoTienda(false),
        })
    }

    return (
        <>
            <Head title="Mi perfil" />

            <TooltipProvider>
                <div className="space-y-6 max-w-2xl">

                    {/* Encabezado */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">Mi perfil</h1>
                            <p className="text-xs text-slate-500">Administra tus datos personales y la información de contacto de la tienda.</p>
                        </div>
                    </div>

                    {/* Datos personales */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">Datos personales</h2>
                                <p className="text-xs text-slate-500">Nombre y acceso a tu cuenta.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="text-xs font-medium text-slate-700">Nombre</label>
                                <Input
                                    id="name"
                                    value={personal.name}
                                    onChange={e => setPersonal(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Tu nombre completo"
                                    disabled={!puedeEditar}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-700">Correo electrónico</label>
                                <Input value={email} disabled className="text-slate-400" />
                                <p className="text-[11px] text-slate-400">El correo no se puede cambiar desde aquí.</p>
                            </div>
                        </div>

                        {/* Cambio de contraseña */}
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                            <div className="flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-medium text-slate-700">Cambiar contraseña</span>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="password_actual" className="text-xs font-medium text-slate-700">Contraseña actual</label>
                                <Input
                                    id="password_actual"
                                    type="password"
                                    value={pass.password_actual}
                                    onChange={e => { setPass(f => ({ ...f, password_actual: e.target.value })); setErrPass(null) }}
                                    placeholder="••••••••"
                                    disabled={!puedeEditar}
                                    className={errPass ? 'border-red-400 focus-visible:ring-red-200' : ''}
                                />
                                {errPass && <p className="text-[11px] text-red-500">{errPass}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="text-xs font-medium text-slate-700">Nueva contraseña</label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={pass.password}
                                        onChange={e => setPass(f => ({ ...f, password: e.target.value }))}
                                        placeholder="••••••••"
                                        disabled={!puedeEditar}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="password_confirmation" className="text-xs font-medium text-slate-700">Confirmar contraseña</label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={pass.password_confirmation}
                                        onChange={e => setPass(f => ({ ...f, password_confirmation: e.target.value }))}
                                        placeholder="••••••••"
                                        disabled={!puedeEditar}
                                    />
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400">Déjalo vacío si no deseas cambiar la contraseña.</p>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button onClick={guardarPersonal} disabled={guardandoPersonal || !puedeEditar}>
                                            {guardandoPersonal ? 'Guardando…' : 'Guardar datos personales'}
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                            </Tooltip>
                        </div>
                    </div>

                    {/* Datos de la tienda */}
                    <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                <Store className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">Datos de la tienda</h2>
                                <p className="text-xs text-slate-500">Información de contacto que ven los clientes en las notificaciones de WhatsApp.</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="tienda_telefono" className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                                <Phone className="w-4 h-4 text-slate-400" />
                                Teléfono de contacto
                            </label>
                            <Input
                                id="tienda_telefono"
                                type="tel"
                                value={tienda.tienda_telefono}
                                onChange={e => setTienda(f => ({ ...f, tienda_telefono: e.target.value }))}
                                placeholder="Ej: 3001234567"
                                disabled={!puedeEditarTienda}
                                className="max-w-xs"
                            />
                            <p className="text-[11px] text-slate-400">Sin código de país. Ej: 3233332112</p>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button onClick={guardarTienda} disabled={guardandoTienda || !puedeEditarTienda}>
                                            {guardandoTienda ? 'Guardando…' : 'Guardar datos de la tienda'}
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                {!puedeEditarTienda && <TooltipContent>No tienes permiso para editar los datos de la tienda</TooltipContent>}
                            </Tooltip>
                        </div>
                    </div>

                </div>
            </TooltipProvider>
        </>
    )
}

PerfilIndex.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Mi perfil' },
    ]}>{page}</AdminLayout>
)
