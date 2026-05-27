import { type ReactNode, useEffect, useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { CreditCard } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { TooltipProvider } from '@/Components/ui/Tooltip'
import MetodoCard from './parts/MetodoCard'
import SheetConfigMetodo from './parts/SheetConfigMetodo'
import type { MetodoPago } from './parts/types'

interface Props {
    metodos:          MetodoPago[]
    mp_configurado:   boolean
    mp_sandbox:       boolean
    bold_configurado: boolean
}

// Helper: chequea si un método "está configurado" según su clave. Para
// pasarelas externas (MP/Bold) miramos un flag del backend; para los
// locales (contraentrega, transferencia) basta con que su `config` exista.
function calcularEstado(metodo: MetodoPago, flags: { mp: boolean; bold: boolean }): { configurado: boolean; infoExtra?: string } {
    switch (metodo.clave) {
        case 'mercadopago':
            return { configurado: flags.mp }
        case 'bold':
            return { configurado: flags.bold }
        case 'contraentrega': {
            const recargo = Number(metodo.config?.recargo ?? 0)
            return {
                configurado: true,
                infoExtra:   recargo > 0 ? `Recargo: $${recargo.toLocaleString('es-CO')}` : 'Sin recargo',
            }
        }
        case 'transferencia':
            return { configurado: !!metodo.config?.numero_cuenta }
        default:
            return { configurado: true }
    }
}

export default function MetodosPago({ metodos, mp_configurado, mp_sandbox, bold_configurado }: Props) {
    const { props } = usePage<{ auth: { permissions: string[] }; flash?: { status?: string } }>()
    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)
    const puedeEditar = puede('metodos-pago.editar')

    const [configurando, setConfigurando] = useState<MetodoPago | null>(null)

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    function toggleMetodo(metodo: MetodoPago) {
        if (!puedeEditar) return
        router.post(route('admin.metodos-pago.toggle', metodo.id), {}, {
            preserveScroll: true,
            onError: (errors) => toast.error((errors.metodo as string | undefined) ?? 'Error al cambiar el estado'),
        })
    }

    function configurar(metodo: MetodoPago) {
        const claveConSheet = ['contraentrega', 'transferencia']
        if (claveConSheet.includes(metodo.clave)) {
            setConfigurando(metodo)
        }
    }

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {metodos.map(metodo => {
                            const { configurado, infoExtra } = calcularEstado(metodo, { mp: mp_configurado, bold: bold_configurado })
                            const sandboxInfo = metodo.clave === 'mercadopago' && mp_configurado && mp_sandbox ? 'Modo Sandbox' : undefined
                            const esExterno  = metodo.clave === 'mercadopago' || metodo.clave === 'bold'

                            return (
                                <MetodoCard
                                    key={metodo.id}
                                    metodo={metodo}
                                    configurado={configurado}
                                    infoExtra={sandboxInfo ?? infoExtra}
                                    puedeEditar={puedeEditar}
                                    onToggle={() => toggleMetodo(metodo)}
                                    onConfigurar={!esExterno ? () => configurar(metodo) : undefined}
                                    urlExterna={esExterno ? route('admin.integraciones.pasarelas') : undefined}
                                />
                            )
                        })}
                    </div>

                    <SheetConfigMetodo
                        metodo={configurando}
                        puedeEditar={puedeEditar}
                        onClose={() => setConfigurando(null)}
                    />

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
