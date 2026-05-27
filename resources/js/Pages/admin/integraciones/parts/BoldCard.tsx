import { Zap, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Button } from '@/Components/ui/Button'

export interface BoldFormState {
    bold_identity_key: string
    bold_secret_key:   string
}

interface Props {
    form:                 BoldFormState
    setForm:              (form: BoldFormState | ((prev: BoldFormState) => BoldFormState)) => void
    puedeEditar:          boolean
    webhookUrl:           string
    identityKeyPresente:  boolean
    secretKeyPresente:    boolean
    embedded?:            boolean
}

// Sentinel: si el form lo envía, el backend mantiene el valor actual sin reescribirlo.
const TOKEN_NO_CAMBIAR = '***'

function CopyButton({ texto }: { texto: string }) {
    const [copiado, setCopiado] = useState(false)
    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
                navigator.clipboard.writeText(texto)
                setCopiado(true)
                setTimeout(() => setCopiado(false), 1500)
            }}
            className="h-7 px-2 text-xs"
        >
            {copiado ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {copiado ? 'Copiado' : 'Copiar'}
        </Button>
    )
}

export function BoldCard({ form, setForm, puedeEditar, webhookUrl, identityKeyPresente, secretKeyPresente, embedded = false }: Props) {
    const containerCls = embedded
        ? 'space-y-5'
        : 'rounded-lg border border-slate-200 bg-white p-6 space-y-5'

    return (
        <div className={containerCls}>

            {!embedded && (
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                        <Zap className="size-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Bold</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Tarjetas, PSE, Nequi, Bancolombia y QR. Comisión desde 1.50%.
                        </p>
                    </div>
                </div>
                <a
                    href="https://comercios.bold.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition-colors duration-200"
                >
                    Panel Bold
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="bold_identity_key">Identity Key (API Key)</Label>
                    <Input
                        id="bold_identity_key"
                        type="password"
                        value={form.bold_identity_key}
                        onChange={e => setForm(f => ({ ...f, bold_identity_key: e.target.value }))}
                        onFocus={e => {
                            if (e.target.value === TOKEN_NO_CAMBIAR) {
                                setForm(f => ({ ...f, bold_identity_key: '' }))
                            }
                        }}
                        onBlur={e => {
                            if (e.target.value === '' && identityKeyPresente) {
                                setForm(f => ({ ...f, bold_identity_key: TOKEN_NO_CAMBIAR }))
                            }
                        }}
                        placeholder={identityKeyPresente ? '••• guardada' : 'identity_key_xxx'}
                        disabled={!puedeEditar}
                        className="font-mono text-sm"
                    />
                    <p className="text-[11px] text-slate-500">Bold → Integraciones → API Keys.</p>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="bold_secret_key">Secret Key (firma webhook)</Label>
                    <Input
                        id="bold_secret_key"
                        type="password"
                        value={form.bold_secret_key}
                        onChange={e => setForm(f => ({ ...f, bold_secret_key: e.target.value }))}
                        onFocus={e => {
                            if (e.target.value === TOKEN_NO_CAMBIAR) {
                                setForm(f => ({ ...f, bold_secret_key: '' }))
                            }
                        }}
                        onBlur={e => {
                            if (e.target.value === '' && secretKeyPresente) {
                                setForm(f => ({ ...f, bold_secret_key: TOKEN_NO_CAMBIAR }))
                            }
                        }}
                        placeholder={secretKeyPresente ? '••• guardada' : 'secret_key_xxx'}
                        disabled={!puedeEditar}
                        className="font-mono text-sm"
                    />
                    <p className="text-[11px] text-slate-500">Para verificar la firma del webhook (HMAC-SHA256).</p>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
                <Label>URL del webhook</Label>
                <div className="flex items-center gap-2 bg-slate-50 rounded-md border border-slate-200 px-3 py-2">
                    <code className="flex-1 text-xs text-slate-700 font-mono break-all">{webhookUrl}</code>
                    <CopyButton texto={webhookUrl} />
                </div>
                <p className="text-[11px] text-slate-500">
                    Configúrala en el panel de Bold → Configuración → Webhooks. Bold notificará cada pago aprobado/rechazado a esta URL.
                </p>
            </div>

        </div>
    )
}
