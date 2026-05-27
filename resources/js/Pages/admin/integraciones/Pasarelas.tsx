import { useState, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { CreditCard } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { TooltipProvider } from '@/Components/ui/Tooltip'
import PasarelaCard from './parts/PasarelaCard'
import SheetConfigPasarela from './parts/SheetConfigPasarela'
import { ComingSoonCard } from './parts/ComingSoonCard'
import type { MercadoPagoFormState } from './parts/MercadoPagoCard'
import type { BoldFormState } from './parts/BoldCard'

interface Props {
    mp_access_token_sandbox: string | null
    mp_public_key_sandbox:   string | null
    mp_access_token_prod:    string | null
    mp_public_key_prod:      string | null
    mp_webhook_secret_set:   boolean
    mp_sandbox:              boolean
    mp_webhook_url:          string
    bold_identity_key_set:   boolean
    bold_secret_key_set:     boolean
    bold_webhook_url:        string
}

const TOKEN_NO_CAMBIAR = '***'

const PROXIMAS_PASARELAS = [
    { nombre: 'Wompi',  descripcion: 'Pasarela de Bancolombia. Tarjetas, PSE, Nequi y efectivo.' },
    { nombre: 'PayU',   descripcion: 'Pasarela regional con cobertura en toda Latinoamérica.' },
    { nombre: 'ePayco', descripcion: 'Pasarela colombiana con integración sencilla y soporte local.' },
]

type Clave = 'mercadopago' | 'bold' | null
type FormState = MercadoPagoFormState & BoldFormState

export default function Pasarelas({
    mp_access_token_sandbox, mp_public_key_sandbox, mp_access_token_prod, mp_public_key_prod,
    mp_webhook_secret_set, mp_sandbox, mp_webhook_url,
    bold_identity_key_set, bold_secret_key_set, bold_webhook_url,
}: Props) {
    const { props } = usePage<{ auth: { permissions: string[] } }>()
    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)
    const puedeEditar = puede('integraciones.editar')

    const [configurando, setConfigurando] = useState<Clave>(null)
    const [guardando, setGuardando] = useState(false)
    const [form, setForm] = useState<FormState>({
        mp_access_token_sandbox: mp_access_token_sandbox ?? '',
        mp_public_key_sandbox:   mp_public_key_sandbox   ?? '',
        mp_access_token_prod:    mp_access_token_prod    ?? '',
        mp_public_key_prod:      mp_public_key_prod      ?? '',
        mp_webhook_secret:       mp_webhook_secret_set ? TOKEN_NO_CAMBIAR : '',
        mp_sandbox,
        bold_identity_key:       bold_identity_key_set ? TOKEN_NO_CAMBIAR : '',
        bold_secret_key:         bold_secret_key_set   ? TOKEN_NO_CAMBIAR : '',
    })

    const mpConfigurado = !!(mp_access_token_sandbox || mp_access_token_prod)
    const mpInfoExtra   = mpConfigurado
        ? (mp_sandbox ? 'Sandbox activo' : 'Producción activo')
        : undefined

    const boldConfigurado = bold_identity_key_set && bold_secret_key_set
    const boldInfoExtra   = boldConfigurado ? 'Listo para recibir pagos' : undefined

    function guardar() {
        setGuardando(true)
        router.post(route('admin.integraciones.pasarelas.update'), form as any, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Configuración guardada correctamente')
                setConfigurando(null)
            },
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
                            <p className="text-xs text-slate-500">Conecta tus pasarelas para procesar pagos en línea.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PasarelaCard
                            clave="mercadopago"
                            nombre="Mercado Pago"
                            descripcion="Tarjeta, PSE, Nequi y más. La pasarela más usada en Colombia."
                            configurado={mpConfigurado}
                            infoExtra={mpInfoExtra}
                            puedeEditar={puedeEditar}
                            onConfigurar={() => setConfigurando('mercadopago')}
                            docsUrl="https://www.mercadopago.com.co/developers/es/docs"
                        />
                        <PasarelaCard
                            clave="bold"
                            nombre="Bold"
                            descripcion="Tarjeta, PSE, Nequi, Bancolombia y QR. Comisión desde 1.50%."
                            configurado={boldConfigurado}
                            infoExtra={boldInfoExtra}
                            puedeEditar={puedeEditar}
                            onConfigurar={() => setConfigurando('bold')}
                            docsUrl="https://developers.bold.co/"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {PROXIMAS_PASARELAS.map(p => (
                            <ComingSoonCard key={p.nombre} nombre={p.nombre} descripcion={p.descripcion} />
                        ))}
                    </div>

                    <SheetConfigPasarela
                        clave={configurando}
                        form={form}
                        setForm={setForm}
                        puedeEditar={puedeEditar}
                        guardando={guardando}
                        onGuardar={guardar}
                        onClose={() => setConfigurando(null)}
                        mpWebhookUrl={mp_webhook_url}
                        boldWebhookUrl={bold_webhook_url}
                        identityKeyPresente={bold_identity_key_set}
                        secretKeyPresente={bold_secret_key_set}
                    />

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
