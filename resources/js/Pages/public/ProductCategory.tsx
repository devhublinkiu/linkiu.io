import { type ReactNode } from 'react'
import { Link } from '@inertiajs/react'
import WebLayout from '@/Layouts/WebLayout'
import ProductCard, { useFlashTimer } from '@/Components/public/products/ProductCard'
import { CATEGORIAS, PRODUCTOS } from '@/data/productos'

interface Props {
    categoriaSlug: string
}

function ProductCategory({ categoriaSlug }: Props) {
    const { h, m, s } = useFlashTimer()

    const categoria = CATEGORIAS.find(c => c.slug === categoriaSlug)
    const productos = PRODUCTOS.filter(p => p.categoria === categoriaSlug)

    if (!categoria) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-24 text-center">
                <p className="text-slate-400 text-lg">Categoría no encontrada.</p>
                <Link href="/productos" className="mt-4 inline-block text-sm font-medium text-slate-600 underline">
                    Ver todos los productos
                </Link>
            </div>
        )
    }

    return (
        <>
            {/* Header de categoría */}
            <section className="bg-white border-b border-slate-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                        <Link href="/" className="hover:text-slate-600 transition-colors duration-200">Inicio</Link>
                        <span>/</span>
                        <Link href="/productos" className="hover:text-slate-600 transition-colors duration-200">Productos</Link>
                        <span>/</span>
                        <span className="text-slate-600 font-medium">{categoria.nombre}</span>
                    </div>

                    <div className="flex items-end justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{categoria.nombre}</h1>
                            <p className="text-slate-500 mt-1.5 max-w-xl">{categoria.descripcion}</p>
                        </div>
                        <span className="text-sm text-slate-400 shrink-0">
                            {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
                        </span>
                    </div>

                    {/* Otras categorías */}
                    <div className="flex items-center gap-2 mt-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        <Link
                            href="/productos"
                            className="shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-slate-400 transition-colors duration-200"
                        >
                            Todos
                        </Link>
                        {CATEGORIAS.map(cat => (
                            <Link
                                key={cat.slug}
                                href={`/productos/${cat.slug}`}
                                className={`shrink-0 text-sm font-medium px-4 py-1.5 rounded-full border transition-colors duration-200 ${
                                    cat.slug === categoriaSlug
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'text-slate-600 border-slate-200 hover:border-slate-400'
                                }`}
                            >
                                {cat.nombre}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Grid */}
            <section className="bg-slate-50 py-10 min-h-[60vh]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {productos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {productos.map(p => (
                                <ProductCard key={p.id} producto={p} h={h} m={m} s={s} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <p className="text-slate-400 text-lg">Próximamente productos en esta categoría.</p>
                            <Link
                                href="/productos"
                                className="mt-4 text-sm font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900 transition-colors duration-200"
                            >
                                Ver todos los productos
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

ProductCategory.layout = (page: ReactNode) => <WebLayout>{page}</WebLayout>

export default ProductCategory
