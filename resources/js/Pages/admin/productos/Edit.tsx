import { Head, Link, usePage } from '@inertiajs/react'
import { ChevronLeft, Info, CircleDollarSign, Images, Layers, Zap, LayoutTemplate } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import AdminLayout from '@/Layouts/AdminLayout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/Tabs'
import TabInformacion  from './parts/TabInformacion'
import TabPrecio       from './parts/TabPrecio'
import TabImagenes     from './parts/TabImagenes'
import TabVariables    from './parts/TabVariables'
import TabLinkiuHooks  from './parts/TabLinkiuHooks'
import TabLayout       from './parts/TabLayout'

// Orden: información → imágenes → precio. El precio va DESPUÉS de imágenes
// porque las ofertas por cantidad necesitan asignar una imagen por oferta,
// así que es natural subirlas primero.
const TABS = [
    { id: 'informacion', label: 'Información',  icon: Info              },
    { id: 'imagenes',    label: 'Imágenes',      icon: Images            },
    { id: 'precio',      label: 'Precio',        icon: CircleDollarSign  },
    { id: 'variables',   label: 'Variables',     icon: Layers            },
    { id: 'linkiuhooks', label: 'LinkiuHooks',   icon: Zap               },
    { id: 'layout',      label: 'Layout',          icon: LayoutTemplate    },
]

interface Categoria {
    id: number
    name: string
}

export interface CantidadData {
    id?: number
    imagen: string | null
    cantidad: number
    precio_bundle: number
    badge_texto: string | null
    destacado: boolean
    orden: number
}

export interface ImagenData {
    id: number
    url: string
    principal: boolean
    orden: number
}

export interface VariableItemData {
    id: number
    nombre: string
    valor: string | null
    url: string | null
    precio_ajuste: number | null
    activo: boolean
    orden: number
}

export interface VariableGrupoData {
    id: number
    nombre: string
    tipo: 'color' | 'imagen' | 'texto'
    orden: number
    items: VariableItemData[]
}

export interface HookData {
    key: string
    activo: boolean
    config: Record<string, unknown> | null
}

export interface HookCatalogItem {
    key: string
    label: string
    tipo: 'simple' | 'configurable'
    descripcion: string
    vista: 'individual' | 'card'
}

export interface ProductoData {
    id: number
    nombre: string
    slug: string
    descripcion: string | null
    category_id: number | null
    sku: string | null
    status: string
    precio_base: number | null
    precio_comparacion: number | null
    aplica_iva: boolean
    iva_porcentaje: number
    cantidades: CantidadData[]
    imagenes: ImagenData[]
    grupos: VariableGrupoData[]
    hooks: HookData[]
    layout_orden: string[] | null
}

interface Props {
    producto: ProductoData
    categorias: Categoria[]
    catalogo_hooks: HookCatalogItem[]
}

export default function ProductoEdit({ producto, categorias, catalogo_hooks }: Props) {
    const { props } = usePage<{ flash?: { status?: string } }>()

    useEffect(() => {
        if (props.flash?.status) toast.success(props.flash.status)
    }, [props.flash?.status])

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Panel',     href: route('admin.dashboard') },
                { label: 'Productos', href: route('admin.productos.index') },
                { label: producto.nombre },
            ]}
        >
            <Head title={producto.nombre} />

            <div className="mb-6 flex items-center gap-3">
                <Link
                    href={route('admin.productos.index')}
                    className="rounded-md p-1.5 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-600"
                >
                    <ChevronLeft className="size-4" />
                </Link>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-900">{producto.nombre}</h2>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            producto.status === 'activo'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                        }`}>
                            {producto.status === 'activo' ? 'Activo' : 'Borrador'}
                        </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">SKU: {producto.sku}</p>
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
                        <TabsContent value="informacion"><TabInformacion categorias={categorias} producto={producto} /></TabsContent>
                        <TabsContent value="precio"><TabPrecio producto={producto} /></TabsContent>
                        <TabsContent value="imagenes"><TabImagenes producto={producto} /></TabsContent>
                        <TabsContent value="variables"><TabVariables producto={producto} /></TabsContent>
                        <TabsContent value="linkiuhooks"><TabLinkiuHooks producto={producto} catalogo={catalogo_hooks} /></TabsContent>
                        <TabsContent value="layout"><TabLayout producto={producto} catalogo={catalogo_hooks} /></TabsContent>
                    </div>
                </Tabs>
            </div>

        </AdminLayout>
    )
}
