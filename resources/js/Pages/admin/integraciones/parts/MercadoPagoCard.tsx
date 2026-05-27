import { CreditCard, ExternalLink, FlaskConical, Globe } from 'lucide-react'
import { Badge } from '@/Components/ui/Badge'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Switch } from '@/Components/ui/Switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/Tooltip'
import { cn } from '@/lib/utils'

export interface MercadoPagoFormState {
    mp_access_token_sandbox: string
    mp_public_key_sandbox:   string
    mp_access_token_prod:    string
    mp_public_key_prod:      string
    mp_webhook_secret:       string
    mp_sandbox:              boolean
}

interface Props {
    form:        MercadoPagoFormState
    setForm:     (updater: (prev: MercadoPagoFormState) => MercadoPagoFormState) => void
    puedeEditar: boolean
    webhookUrl:  string
    embedded?:   boolean
}

/**
 * Card de configuración de MercadoPago: header + toggle sandbox/prod,
 * 2 columnas de credenciales (prueba y producción) + webhook secret.
 *
 * `webhookUrl` viene del backend (no `window.location.origin`) para
 * compatibilidad con SSR.
 *
 * Con `embedded={true}` se renderiza sin contenedor ni header — para usarse
 * dentro de un Sheet que ya provee esos elementos.
 */
export function MercadoPagoCard({ form, setForm, puedeEditar, webhookUrl, embedded = false }: Props) {
    const containerCls = embedded
        ? 'space-y-6'
        : 'rounded-lg border border-slate-200 bg-white p-6 space-y-6'

    return (
        <div className={containerCls}>

            {/* Header — oculto cuando está embebido en un Sheet */}
            {!embedded && (
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    <CreditCard className="size-4 text-slate-500" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-semibold text-slate-900">Mercado Pago</h3>
                        <Badge variant={form.mp_sandbox ? 'secondary' : 'default'}>
                            {form.mp_sandbox ? 'Modo prueba activo' : 'Producción activo'}
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Acepta tarjetas, PSE, Nequi y más con la pasarela más usada en Colombia.
                    </p>
                </div>
            </div>
            )}

            {/* Toggle modo activo */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                    <p className="text-xs font-medium text-slate-700">Modo activo</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {form.mp_sandbox
                            ? 'Usando credenciales de prueba — los pagos no son reales'
                            : 'Usando credenciales de producción — los pagos son reales'}
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className={cn('text-xs font-medium', form.mp_sandbox ? 'text-slate-500' : 'text-slate-700')}>
                        Producción
                    </span>
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
                    <span className={cn('text-xs font-medium', form.mp_sandbox ? 'text-slate-700' : 'text-slate-500')}>
                        Prueba
                    </span>
                </div>
            </div>

            {/* Credenciales — una sola columna para mejor lectura */}
            <div className="grid grid-cols-1 gap-4">
                <CredencialesColumn
                    titulo="Credenciales de prueba"
                    icono={FlaskConical}
                    iconoColor="text-amber-500"
                    activas={form.mp_sandbox}
                    bordeActivo="border-amber-300 bg-amber-50/40"
                    panelMpLabel="Credenciales de prueba"
                    accessTokenValue={form.mp_access_token_sandbox}
                    publicKeyValue={form.mp_public_key_sandbox}
                    onAccessTokenChange={v => setForm(f => ({ ...f, mp_access_token_sandbox: v }))}
                    onPublicKeyChange={v => setForm(f => ({ ...f, mp_public_key_sandbox: v }))}
                    puedeEditar={puedeEditar}
                />
                <CredencialesColumn
                    titulo="Credenciales de producción"
                    icono={Globe}
                    iconoColor="text-emerald-500"
                    activas={!form.mp_sandbox}
                    bordeActivo="border-emerald-300 bg-emerald-50/40"
                    panelMpLabel="Credenciales de producción"
                    accessTokenValue={form.mp_access_token_prod}
                    publicKeyValue={form.mp_public_key_prod}
                    onAccessTokenChange={v => setForm(f => ({ ...f, mp_access_token_prod: v }))}
                    onPublicKeyChange={v => setForm(f => ({ ...f, mp_public_key_prod: v }))}
                    puedeEditar={puedeEditar}
                />
            </div>

            {/* Webhook secret + URL */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                    <Label>
                        Webhook Secret <span className="text-slate-500 font-normal">(secreto)</span>
                    </Label>
                    <Badge variant={form.mp_webhook_secret ? 'default' : 'secondary'} className="text-xs">
                        {form.mp_webhook_secret ? 'Configurado' : 'Sin configurar'}
                    </Badge>
                </div>
                <Input
                    type="password"
                    value={form.mp_webhook_secret}
                    onChange={e => setForm(f => ({ ...f, mp_webhook_secret: e.target.value }))}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    disabled={!puedeEditar}
                    className="font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                    Panel MP → Tus integraciones → Notificaciones → Clave secreta.
                </p>
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
                    <p className="text-xs font-medium text-slate-600">URL que debes registrar en Mercado Pago:</p>
                    <code className="text-xs text-slate-500 font-mono break-all">{webhookUrl}</code>
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
    )
}

// ─────────────────────────────────────────────────────────────────
// Sub-componente: una columna de credenciales (prueba o producción)
// ─────────────────────────────────────────────────────────────────

interface CredencialesColumnProps {
    titulo:              string
    icono:               React.ComponentType<{ className?: string }>
    iconoColor:          string
    activas:             boolean
    bordeActivo:         string
    panelMpLabel:        string
    accessTokenValue:    string
    publicKeyValue:      string
    onAccessTokenChange: (v: string) => void
    onPublicKeyChange:   (v: string) => void
    puedeEditar:         boolean
}

function CredencialesColumn({
    titulo, icono: Icono, iconoColor, activas, bordeActivo, panelMpLabel,
    accessTokenValue, publicKeyValue, onAccessTokenChange, onPublicKeyChange, puedeEditar,
}: CredencialesColumnProps) {
    return (
        <div className={cn(
            'rounded-lg border-2 p-4 space-y-4 transition-colors duration-200',
            activas ? bordeActivo : 'border-slate-200 bg-white',
        )}>
            <div className="flex items-center gap-2">
                <Icono className={`w-4 h-4 shrink-0 ${iconoColor}`} />
                <span className="text-xs font-semibold text-slate-700">{titulo}</span>
                {activas && (
                    <Badge variant={activas && bordeActivo.includes('emerald') ? 'default' : 'secondary'} className="ml-auto text-xs">
                        Activas ahora
                    </Badge>
                )}
            </div>
            <p className="text-xs text-slate-500 -mt-2">
                Obtenlas en tu panel MP → <span className="font-medium">{panelMpLabel}</span>.
            </p>

            <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                    <Label>
                        Access Token <span className="text-slate-500 font-normal">(secreto)</span>
                    </Label>
                    <Badge variant={accessTokenValue ? 'default' : 'secondary'} className="text-xs">
                        {accessTokenValue ? 'Configurado' : 'Sin configurar'}
                    </Badge>
                </div>
                <Input
                    type="password"
                    value={accessTokenValue}
                    onChange={e => onAccessTokenChange(e.target.value)}
                    placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    disabled={!puedeEditar}
                    className="font-mono text-sm"
                />
            </div>

            <div className="space-y-1.5">
                <Label>Public Key</Label>
                <Input
                    value={publicKeyValue}
                    onChange={e => onPublicKeyChange(e.target.value)}
                    placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    disabled={!puedeEditar}
                    className="font-mono text-sm"
                />
            </div>
        </div>
    )
}
