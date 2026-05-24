import { useState, type ReactNode } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { CreditCard } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import { MercadoPagoCard, type MercadoPagoFormState } from './parts/MercadoPagoCard'
import { ComingSoonCard } from './parts/ComingSoonCard'

interface Props {
    mp_access_token_sandbox: string | null
    mp_public_key_sandbox:   string | null
    mp_access_token_prod:    string | null
    mp_public_key_prod:      string | null
    mp_webhook_secret:       string | null
    mp_sandbox:              boolean
    webhook_url:             string
}

const PROXIMAS_PASARELAS = [
    { nombre: 'Wompi',  descripcion: 'Pasarela de Bancolombia. Tarjetas, PSE, Nequi y efectivo.' },
    { nombre: 'PayU',   descripcion: 'Pasarela regional con cobertura en toda Latinoamérica.' },
    { nombre: 'ePayco', descripcion: 'Pasarela colombiana con integración sencilla y soporte local.' },
]

export default function Pasarelas({
    mp_access_token_sandbox,
    mp_public_key_sandbox,
    mp_access_token_prod,
    mp_public_key_prod,
    mp_webhook_secret,
    mp_sandbox,
    webhook_url,
}: Props) {
    const { props } = usePage<{ auth: { permissions: string[] } }>()
    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)
    const puedeEditar = puede('integraciones.editar')

    const [form, setForm] = useState<MercadoPagoFormState>({
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
        // `as any` — Inertia router exige `RequestPayload` con index signature.
        // El form es un objeto fijo conocido (no dinámico) que el backend valida.
        router.post(route('admin.integraciones.pasarelas.update'), form as any, {
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

                    <MercadoPagoCard
                        form={form}
                        setForm={setForm}
                        puedeEditar={puedeEditar}
                        webhookUrl={webhook_url}
                    />

                    <div className="grid grid-cols-3 gap-4">
                        {PROXIMAS_PASARELAS.map(p => (
                            <ComingSoonCard key={p.nombre} nombre={p.nombre} descripcion={p.descripcion} />
                        ))}
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
