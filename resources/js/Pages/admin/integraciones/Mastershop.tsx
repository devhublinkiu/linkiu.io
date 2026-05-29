import { useState, type ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { Store } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { TooltipProvider } from '@/Components/ui/Tooltip'
import ConfigCardMastershop from './parts/ConfigCardMastershop'
import ProductosTablaMastershop, { type ProductoMastershop } from './parts/ProductosTablaMastershop'
import VincularSheetMastershop from './parts/VincularSheetMastershop'

interface Props {
    api_key_configurada: boolean
    productos:           ProductoMastershop[]
}

export default function Mastershop({ api_key_configurada, productos }: Props) {
    const { props } = usePage<{ auth: { permissions: string[] } }>()
    const puede = (permiso: string) =>
        props.auth.permissions.includes('*') || props.auth.permissions.includes(permiso)
    const puedeEditarIntegraciones = puede('integraciones.editar')
    const puedeEditarProductos     = puede('productos.editar')

    const [productoAVincular, setProductoAVincular] = useState<ProductoMastershop | null>(null)

    return (
        <>
            <Head title="Mastershop" />

            <TooltipProvider>
                <div className="space-y-6">

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Store className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">Mastershop</h1>
                            <p className="text-xs text-slate-500">
                                Conectá tu cuenta para enrolar productos del catálogo Mastershop con los tuyos.
                            </p>
                        </div>
                    </div>

                    <ConfigCardMastershop
                        configurada={api_key_configurada}
                        puedeEditar={puedeEditarIntegraciones}
                    />

                    <ProductosTablaMastershop
                        productos={productos}
                        apiKeyConfigurada={api_key_configurada}
                        puedeVincular={puedeEditarProductos && api_key_configurada}
                        onVincular={setProductoAVincular}
                    />

                    <VincularSheetMastershop
                        producto={productoAVincular}
                        onClose={() => setProductoAVincular(null)}
                    />

                </div>
            </TooltipProvider>
        </>
    )
}

Mastershop.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={[
        { label: 'Panel', href: route('admin.dashboard') },
        { label: 'Integraciones' },
        { label: 'Mastershop' },
    ]}>{page}</AdminLayout>
)
