import { type ReactNode, useState } from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import WebLayout from '@/Layouts/WebLayout'
import ProductCard, { useFlashTimer, type ProductoPublico } from '@/Components/public/products/ProductCard'
import { cn } from '@/lib/utils'

interface Props {
    productos: ProductoPublico[]
}

function Products({ productos }: Props) {
    const [categoriaActiva, setCategoriaActiva] = useState('todos')
    const { h, m, s } = useFlashTimer()
    const { nav_categorias, build } = usePage<{
        nav_categorias: { id: number; name: string; slug: string }[]
        build?: { nombre_tienda?: string }
    }>().props
    const nombreTienda = build?.nombre_tienda || 'Mi tienda'

    const productosFiltrados = categoriaActiva === 'todos'
        ? productos
        : productos.filter(p => p.categoria_slug === categoriaActiva)

    return (
        <>
            <Head>
                <title>{`Todos los productos | ${nombreTienda}`}</title>
                <meta name="description" content={`Explora todos los productos de ${nombreTienda}. ${productos.length} productos disponibles.`} />
                <meta property="og:title"       content={`Todos los productos | ${nombreTienda}`} />
                <meta property="og:description" content={`Explora todos los productos de ${nombreTienda}.`} />
                <meta property="og:site_name"   content={nombreTienda} />
                <meta property="og:type"        content="website" />
            </Head>

            {/* Header */}
            <section className="bg-white border-b border-slate-100 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                                <Link href="/" className="hover:text-slate-600 transition-colors duration-200">Inicio</Link>
                                <span>/</span>
                                <span className="text-slate-600 font-medium">Productos</span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Toda la línea</h1>
                            <p className="text-slate-500 mt-1">{productos.length} productos disponibles</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filtros */}
            <section className="bg-white border-b border-slate-100 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center gap-2 overflow-x-auto py-3" style={{ scrollbarWidth: 'none' }}>
                        <button
                            onClick={() => setCategoriaActiva('todos')}
                            className={cn(
                                'shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors duration-200',
                                categoriaActiva === 'todos'
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'text-slate-600 border-slate-200 hover:border-slate-400'
                            )}
                        >
                            Todos
                        </button>
                        {nav_categorias.map(cat => (
                            <button
                                key={cat.slug}
                                onClick={() => setCategoriaActiva(cat.slug)}
                                className={cn(
                                    'shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors duration-200',
                                    categoriaActiva === cat.slug
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'text-slate-600 border-slate-200 hover:border-slate-400'
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Grid */}
            <section className="bg-slate-50 py-10 min-h-[60vh]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {productosFiltrados.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {productosFiltrados.map(p => (
                                <ProductCard key={p.id} producto={p} h={h} m={m} s={s} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <p className="text-slate-400 text-lg">No hay productos en esta categoría aún.</p>
                            <button
                                onClick={() => setCategoriaActiva('todos')}
                                className="mt-4 text-sm font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900 transition-colors duration-200"
                            >
                                Ver todos los productos
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

Products.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default Products
