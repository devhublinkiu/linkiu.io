import { useEffect, type ReactNode } from 'react'
import { router, usePage, Head } from '@inertiajs/react'
import { toast } from 'sonner'
import { BellRing } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Switch } from '@/Components/ui/Switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'

interface Props {
    fomo_enabled: boolean
}

interface SharedProps {
    flash: { status?: string }
    auth:  { permissions: string[] }
    [key: string]: unknown
}

function puede(permissions: string[], permiso: string): boolean {
    return permissions.includes('*') || permissions.includes(permiso)
}

export default function Widgets({ fomo_enabled }: Props) {
    const { flash, auth } = usePage<SharedProps>().props
    const puedeEditar = puede(auth.permissions, 'linkiubuild.editar')

    useEffect(() => {
        if (flash.status) toast.success(flash.status)
    }, [flash.status])

    function toggle(value: boolean) {
        router.post(route('admin.build.widgets.update'), { fomo_enabled: value }, {
            preserveScroll: true,
            onError: () => toast.error('Error al guardar los cambios'),
        })
    }

    return (
        <>
            <Head title="Widgets" />

            <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Widgets</h1>
                    <p className="text-sm text-slate-500 mt-1">Activa o desactiva elementos dinámicos de la tienda.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                <BellRing className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Notificaciones FOMO</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    Muestra toasts con compras recientes y vistas de productos para generar urgencia de compra.
                                    Usa datos reales de órdenes y visitas de las últimas 48 horas.
                                </p>
                            </div>
                        </div>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Switch
                                            checked={fomo_enabled}
                                            onCheckedChange={toggle}
                                            disabled={!puedeEditar}
                                        />
                                    </span>
                                </TooltipTrigger>
                                {!puedeEditar && (
                                    <TooltipContent>No tienes permiso para editar</TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {fomo_enabled && (
                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 rounded-lg px-3 py-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Tipo compra</p>
                                <p className="text-xs text-slate-700">"María G. acaba de comprar"</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg px-3 py-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Tipo vista</p>
                                <p className="text-xs text-slate-700">"Alguien acaba de ver"</p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </>
    )
}

Widgets.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'LinkiuBuild' },
        { label: 'Widgets' },
    ]}>{page}</AdminLayout>
)
