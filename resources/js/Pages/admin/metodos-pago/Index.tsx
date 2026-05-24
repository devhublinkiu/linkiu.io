import { type ReactNode, useEffect } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { CreditCard } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { TooltipProvider } from '@/Components/ui/Tooltip'
import CardMercadoPago from './parts/CardMercadoPago'
import CardContraentrega from './parts/CardContraentrega'
import CardTransferencia from './parts/CardTransferencia'
import type { MetodoPago } from './parts/types'

interface Props {
    metodos:        MetodoPago[]
    mp_configurado: boolean
    mp_sandbox:     boolean
}

export default function MetodosPago({ metodos, mp_configurado, mp_sandbox }: Props) {
    const { props } = usePage<{ auth: { permissions: string[] }; flash?: { status?: string } }>()
    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)
    const puedeEditar = puede('metodos-pago.editar')

    // Flash unificado: mensajes vienen del backend (Método activado/desactivado/
    // Configuración guardada). Una sola fuente de verdad.
    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    const toggleMetodo = (metodo: MetodoPago) => {
        // Guard preventivo en frontend — backend también valida con can:metodos-pago.editar
        if (!puedeEditar) return

        router.post(route('admin.metodos-pago.toggle', metodo.id), {}, {
            preserveScroll: true,
            // toast.success viene del flash unificado. Solo manejamos error aquí.
            onError: (errors) => toast.error((errors.metodo as string | undefined) ?? 'Error al cambiar el estado'),
        })
    }

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
                                puedeEditar={puedeEditar}
                                onToggle={() => toggleMetodo(mp)}
                            />
                        )}
                        {contraentrega && (
                            <CardContraentrega
                                metodo={contraentrega}
                                puedeEditar={puedeEditar}
                                onToggle={() => toggleMetodo(contraentrega)}
                            />
                        )}
                    </div>

                    {transferencia && (
                        <CardTransferencia
                            metodo={transferencia}
                            puedeEditar={puedeEditar}
                            onToggle={() => toggleMetodo(transferencia)}
                        />
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
