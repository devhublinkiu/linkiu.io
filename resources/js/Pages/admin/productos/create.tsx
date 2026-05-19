import { Head, Link } from '@inertiajs/react'
import { ChevronLeft, Info, CircleDollarSign, Images, Layers, Zap } from 'lucide-react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/Tabs'
import TabInformacion  from './parts/TabInformacion'
import TabPrecio       from './parts/TabPrecio'
import TabImagenes     from './parts/TabImagenes'
import TabVariables    from './parts/TabVariables'
import TabLinkiuHooks  from './parts/TabLinkiuHooks'

const TABS = [
    { id: 'informacion', label: 'Información',  icon: Info              },
    { id: 'precio',      label: 'Precio',        icon: CircleDollarSign  },
    { id: 'imagenes',    label: 'Imágenes',      icon: Images            },
    { id: 'variables',   label: 'Variables',     icon: Layers            },
    { id: 'linkiuhooks', label: 'LinkiuHooks',   icon: Zap               },
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
                    <p className="mt-0.5 text-sm text-slate-500">Completa cada sección y guarda por separado.</p>
                </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
                <Tabs defaultValue="informacion">
                    <div className="p-2">
                        <TabsList className="w-full">
                            {TABS.map(({ id, label, icon: Icon }) => (
                                <TabsTrigger key={id} value={id}>
                                    <Icon />
                                    {label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="p-6">
                        <TabsContent value="informacion"><TabInformacion categorias={categorias} /></TabsContent>
                        <TabsContent value="precio"><TabPrecio /></TabsContent>
                        <TabsContent value="imagenes"><TabImagenes /></TabsContent>
                        <TabsContent value="variables"><TabVariables /></TabsContent>
                        <TabsContent value="linkiuhooks"><TabLinkiuHooks /></TabsContent>

                    </div>
                </Tabs>
            </div>

        </AdminLayout>
    )
}
