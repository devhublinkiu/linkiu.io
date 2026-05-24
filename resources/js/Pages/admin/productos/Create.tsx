import { Head, Link } from '@inertiajs/react'
import { ChevronLeft, Info, CircleDollarSign, Images, Layers, Zap } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/Tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import TabInformacion from './parts/TabInformacion'

// Orden: información → imágenes → precio. El precio va DESPUÉS de imágenes
// porque las ofertas por cantidad necesitan asignar una imagen por oferta,
// así que es natural subirlas primero.
const TABS = [
    { id: 'informacion', label: 'Información',  icon: Info,             requiereProducto: false },
    { id: 'imagenes',    label: 'Imágenes',      icon: Images,           requiereProducto: true  },
    { id: 'precio',      label: 'Precio',        icon: CircleDollarSign, requiereProducto: true  },
    { id: 'variables',   label: 'Variables',     icon: Layers,           requiereProducto: true  },
    { id: 'linkiuhooks', label: 'LinkiuHooks',   icon: Zap,              requiereProducto: true  },
]

interface Categoria {
    id: number
    name: string
}

interface Props {
    categorias: Categoria[]
}

export default function ProductoCreate({ categorias }: Props) {
    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Panel',     href: route('admin.dashboard') },
                { label: 'Productos', href: route('admin.productos.index') },
                { label: 'Nuevo producto' },
            ]}
        >
            <Head title="Nuevo producto" />

            <div className="mb-6 flex items-center gap-3">
                <Link
                    href={route('admin.productos.index')}
                    className="rounded-md p-1.5 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-600"
                >
                    <ChevronLeft className="size-4" />
                </Link>
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Nuevo producto</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Guarda la información básica para habilitar el resto de secciones.</p>
                </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
                <TooltipProvider delayDuration={200}>
                    <Tabs defaultValue="informacion">
                        <div className="p-2">
                            <TabsList className="w-full">
                                {TABS.map(({ id, label, icon: Icon, requiereProducto }) => requiereProducto ? (
                                    <Tooltip key={id}>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <TabsTrigger value={id} disabled>
                                                    <Icon />
                                                    {label}
                                                </TabsTrigger>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>Disponible después de guardar la información del producto</TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <TabsTrigger key={id} value={id}>
                                        <Icon />
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div className="p-6">
                            <TabsContent value="informacion"><TabInformacion categorias={categorias} /></TabsContent>
                        </div>
                    </Tabs>
                </TooltipProvider>
            </div>

        </AdminLayout>
    )
}
