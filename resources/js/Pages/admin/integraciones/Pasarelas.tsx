import { useState, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { CreditCard, ExternalLink, FlaskConical, Globe } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Switch } from '@/Components/ui/Switch'
import { Badge } from '@/Components/ui/Badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import { cn } from '@/lib/utils'

interface Props {
    mp_access_token_sandbox: string | null
    mp_public_key_sandbox:   string | null
    mp_access_token_prod:    string | null
    mp_public_key_prod:      string | null
    mp_webhook_secret:       string | null
    mp_sandbox:              boolean
}

export default function Pasarelas({
    mp_access_token_sandbox,
    mp_public_key_sandbox,
    mp_access_token_prod,
    mp_public_key_prod,
    mp_webhook_secret,
    mp_sandbox,
}: Props) {
    const { props } = usePage<{ auth: { permissions: string[] } }>()
    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)
    const puedeEditar = puede('integraciones.editar')

    const [form, setForm] = useState({
        mp_access_token_sandbox: mp_access_token_sandbox ?? '',
        mp_public_key_sandbox:   mp_public_key_sandbox   ?? '',
        mp_access_token_prod:    mp_access_token_prod    ?? '',
        mp_public_key_prod:      mp_public_key_prod      ?? '',
        mp_webhook_secret:       mp_webhook_secret       ?? '',
        mp_sandbox,
    })
    const [guardando, setGuardando] = useState(false)

    function guardar() {
        setGuardando(true)
        router.post(route('admin.integraciones.pasarelas.update'), form, {
            preserveScroll: true,
            onSuccess: () => toast.success('Configuración guardada correctamente'),
            onError:   () => toast.error('Error al guardar la configuración'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <>
            <Head title="Pasarelas de pago" />

            <TooltipProvider>
                <div className="space-y-6">

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">Pasarelas de pago</h1>
                            <p className="text-xs text-slate-500">Conecta tu pasarela para procesar pagos en línea.</p>
                        </div>
                    </div>

                    {/* Mercado Pago */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">

                        {/* Header */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                <CreditCard className="w-4.5 h-4.5 text-slate-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2.5">
                                    <h3 className="text-sm font-semibold text-slate-900">Mercado Pago</h3>
                                    <Badge variant={form.mp_sandbox ? 'secondary' : 'default'}>
                                        {form.mp_sandbox ? 'Modo prueba activo' : 'Producción activo'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">Acepta tarjetas, PSE, Nequi y más con la pasarela más usada en Colombia.</p>
                            </div>
                        </div>

                        {/* Toggle modo activo */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <div>
                                <p className="text-xs font-medium text-slate-700">Modo activo</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    {form.mp_sandbox
                                        ? 'Usando credenciales de prueba — los pagos no son reales'
                                        : 'Usando credenciales de producción — los pagos son reales'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <span className={cn('text-xs font-medium', form.mp_sandbox ? 'text-slate-400' : 'text-slate-700')}>Producción</span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Switch
                                                checked={form.mp_sandbox}
                                                disabled={!puedeEditar}
                                                onCheckedChange={v => setForm(f => ({ ...f, mp_sandbox: v }))}
                                            />
                                        </span>
                                    </TooltipTrigger>
                                    {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                                </Tooltip>
                                <span className={cn('text-xs font-medium', form.mp_sandbox ? 'text-slate-700' : 'text-slate-400')}>Prueba</span>
                            </div>
                        </div>

                        {/* Dos columnas: prueba y producción */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                            {/* Credenciales de prueba */}
                            <div className={cn(
                                'rounded-xl border-2 p-4 space-y-4 transition-colors duration-200',
                                form.mp_sandbox ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 bg-white'
                            )}>
                                <div className="flex items-center gap-2">
                                    <FlaskConical className="w-4 h-4 text-amber-500 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-700">Credenciales de prueba</span>
                                    {form.mp_sandbox && (
                                        <Badge variant="secondary" className="ml-auto text-[10px]">Activas ahora</Badge>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400 -mt-2">
                                    Obtenlas en tu panel MP → <span className="font-medium">Credenciales de prueba</span>.
                                </p>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">
                                        Access Token <span className="text-slate-400 font-normal">(secreto)</span>
                                    </label>
                                    <Input
                                        type="password"
                                        value={form.mp_access_token_sandbox}
                                        onChange={e => setForm(f => ({ ...f, mp_access_token_sandbox: e.target.value }))}
                                        placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        disabled={!puedeEditar}
                                        className="font-mono text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Public Key</label>
                                    <Input
                                        value={form.mp_public_key_sandbox}
                                        onChange={e => setForm(f => ({ ...f, mp_public_key_sandbox: e.target.value }))}
                                        placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                        disabled={!puedeEditar}
                                        className="font-mono text-sm"
                                    />
                                </div>
                            </div>

                            {/* Credenciales de producción */}
                            <div className={cn(
                                'rounded-xl border-2 p-4 space-y-4 transition-colors duration-200',
                                !form.mp_sandbox ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-white'
                            )}>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-700">Credenciales de producción</span>
                                    {!form.mp_sandbox && (
                                        <Badge variant="default" className="ml-auto text-[10px]">Activas ahora</Badge>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400 -mt-2">
                                    Obtenlas en tu panel MP → <span className="font-medium">Credenciales de producción</span>.
                                </p>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">
                                        Access Token <span className="text-slate-400 font-normal">(secreto)</span>
                                    </label>
                                    <Input
                                        type="password"
                                        value={form.mp_access_token_prod}
                                        onChange={e => setForm(f => ({ ...f, mp_access_token_prod: e.target.value }))}
                                        placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        disabled={!puedeEditar}
                                        className="font-mono text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Public Key</label>
                                    <Input
                                        value={form.mp_public_key_prod}
                                        onChange={e => setForm(f => ({ ...f, mp_public_key_prod: e.target.value }))}
                                        placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                        disabled={!puedeEditar}
                                        className="font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Webhook secret — compartido */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700">
                                Webhook Secret <span className="text-slate-400 font-normal">(secreto)</span>
                            </label>
                            <Input
                                type="password"
                                value={form.mp_webhook_secret}
                                onChange={e => setForm(f => ({ ...f, mp_webhook_secret: e.target.value }))}
                                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                disabled={!puedeEditar}
                                className="font-mono text-sm"
                            />
                            <p className="text-[11px] text-slate-400">
                                Panel MP → Tus integraciones → Notificaciones → Clave secreta.
                            </p>
                            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
                                <p className="text-[11px] font-medium text-slate-600">URL que debes registrar en Mercado Pago:</p>
                                <code className="text-[11px] text-slate-500 font-mono break-all">
                                    {window.location.origin}/webhooks/mercadopago
                                </code>
                            </div>
                        </div>

                        <a
                            href="https://www.mercadopago.com.co/developers/es/docs/checkout-bricks/additional-content/best-practices/go-live-and-production-quality/go-to-production"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors duration-200"
                        >
                            Cómo obtener mis credenciales
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Wompi — Próximamente */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 opacity-60 pointer-events-none select-none">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                    <CreditCard className="w-4.5 h-4.5 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2.5">
                                        <h3 className="text-sm font-semibold text-slate-900">Wompi</h3>
                                        <Badge variant="secondary">Próximamente</Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">Pasarela de Bancolombia. Tarjetas, PSE, Nequi y efectivo.</p>
                                </div>
                            </div>
                        </div>

                        {/* PayU — Próximamente */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 opacity-60 pointer-events-none select-none">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                    <CreditCard className="w-4.5 h-4.5 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2.5">
                                        <h3 className="text-sm font-semibold text-slate-900">PayU</h3>
                                        <Badge variant="secondary">Próximamente</Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">Pasarela regional con cobertura en toda Latinoamérica.</p>
                                </div>
                            </div>
                        </div>

                        {/* ePayco — Próximamente */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 opacity-60 pointer-events-none select-none">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                    <CreditCard className="w-4.5 h-4.5 text-slate-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2.5">
                                        <h3 className="text-sm font-semibold text-slate-900">ePayco</h3>
                                        <Badge variant="secondary">Próximamente</Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">Pasarela colombiana con integración sencilla y soporte local.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button onClick={guardar} disabled={guardando || !puedeEditar}>
                                        {guardando ? 'Guardando…' : 'Guardar cambios'}
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                        </Tooltip>
                    </div>

                </div>
            </TooltipProvider>
        </>
    )
}

Pasarelas.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Integraciones' },
    ]}>{page}</AdminLayout>
)
