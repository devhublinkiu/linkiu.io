import { useMemo, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { ChevronDownIcon, XIcon, UserIcon, PackageOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavConfig {
    productos_label:  string
    quienes_label:    string
    blog_label:       string
    contacto_label:   string
    quienes_visible:  boolean
    blog_visible:     boolean
    contacto_visible: boolean
}

interface NavProducto {
    id:                  number
    nombre:              string
    slug:                string
    precio_base:         number | null
    precio_comparacion:  number | null
    imagen:              string | null
}

interface NavCategoria { id: number; name: string; slug: string }

interface MobileMenuProps {
    open:            boolean
    onClose:         () => void
    clienteLogueado: boolean
}

const COLORES_CAT = ['bg-amber-400', 'bg-emerald-500', 'bg-blue-400', 'bg-violet-400', 'bg-orange-400', 'bg-rose-400', 'bg-slate-400']

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

export default function MobileMenu({ open, onClose, clienteLogueado }: MobileMenuProps) {
    const { build, nav_productos, nav_categorias } = usePage<{
        build?:          { logo_tienda?: string | null; logo_tienda_w?: number | null; logo_tienda_h?: number | null; nav?: NavConfig }
        nav_productos:   NavProducto[]
        nav_categorias:  NavCategoria[]
    }>().props

    const nav     = build?.nav
    const logoSrc = build?.logo_tienda || '/assets/build_resources/logo_default_admin.svg'
    const logoW   = build?.logo_tienda_w ?? undefined
    const logoH   = build?.logo_tienda_h ?? undefined

    const productosLabel = nav?.productos_label ?? 'Productos'

    const linksSimples = useMemo(() => {
        const links: { label: string; href: string }[] = []
        if (nav?.quienes_visible  ?? true) links.push({ label: nav?.quienes_label  ?? 'Quiénes Somos', href: route('about')      })
        if (nav?.blog_visible     ?? true) links.push({ label: nav?.blog_label     ?? 'Blog',          href: route('blog.index') })
        if (nav?.contacto_visible ?? true) links.push({ label: nav?.contacto_label ?? 'Contacto',      href: route('contact')    })
        return links
    }, [nav])

    const [productosAbierto, setProductosAbierto] = useState(false)

    return (
        <>
            {/* Overlay oscuro */}
            <div
                className={cn(
                    'fixed inset-0 bg-slate-900/50 z-40 transition-opacity duration-300 ease-in-out md:hidden',
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                )}
                onClick={onClose}
            />

            {/* Panel lateral */}
            <div
                className={cn(
                    'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 flex flex-col shadow-xl transition-transform duration-300 ease-in-out md:hidden',
                    open ? 'translate-x-0' : 'translate-x-full',
                )}
            >
                {/* Cabecera del panel */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <img
                        src={logoSrc}
                        alt="Logo"
                        width={logoW}
                        height={logoH}
                        className="h-6 w-auto"
                        onError={e => { e.currentTarget.src = '/assets/build_resources/logo_default_admin.svg' }}
                    />
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors duration-200 ease-in-out"
                        aria-label="Cerrar menú"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Navegación */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-0.5">

                    <Link
                        href="/"
                        onClick={onClose}
                        className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200 ease-in-out"
                    >
                        Inicio
                    </Link>

                    {/* Productos — accordion */}
                    <div>
                        <button
                            onClick={() => setProductosAbierto(prev => !prev)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200 ease-in-out"
                        >
                            {productosLabel}
                            <ChevronDownIcon className={cn(
                                'w-4 h-4 text-slate-400 transition-transform duration-200',
                                productosAbierto && 'rotate-180',
                            )} />
                        </button>

                        {productosAbierto && (
                            <div className="pl-2 pr-1 pt-1 pb-2 flex flex-col gap-3">

                                {/* Lista de productos */}
                                <div className="flex flex-col gap-1.5">
                                    {nav_productos.length === 0 && (
                                        <p className="text-xs text-slate-400 px-2 py-2">Sin productos disponibles.</p>
                                    )}
                                    {nav_productos.map(p => (
                                        <Link
                                            key={p.id}
                                            href={`/productos/${p.slug}`}
                                            onClick={onClose}
                                            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors duration-200 ease-in-out"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                                                {p.imagen ? (
                                                    <img src={p.imagen} alt={p.nombre} className="size-full object-cover" />
                                                ) : (
                                                    <PackageOpen className="w-5 h-5 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{p.nombre}</p>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-xs font-bold text-slate-900">
                                                        {p.precio_base ? formatPrecio(p.precio_base) : '—'}
                                                    </span>
                                                    {p.precio_comparacion && (
                                                        <span className="text-[10px] text-slate-400 line-through">
                                                            {formatPrecio(p.precio_comparacion)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Categorías */}
                                {nav_categorias.length > 0 && (
                                    <div className="border-t border-slate-100 pt-3">
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">Categorías</p>
                                        <div className="flex flex-col gap-0.5">
                                            {nav_categorias.map((cat, i) => (
                                                <Link
                                                    key={cat.id}
                                                    href={`/productos/${cat.slug}`}
                                                    onClick={onClose}
                                                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors duration-200 ease-in-out"
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${COLORES_CAT[i % COLORES_CAT.length]}`} />
                                                    <span className="text-sm text-slate-600 font-medium">{cat.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Ver todos */}
                                <Link
                                    href="/productos"
                                    onClick={onClose}
                                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 transition-colors duration-200"
                                >
                                    Ver todos los productos →
                                </Link>

                            </div>
                        )}
                    </div>

                    {linksSimples.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                            className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200 ease-in-out"
                        >
                            {link.label}
                        </Link>
                    ))}

                </nav>

                {/* CTA cuenta */}
                <div className="px-4 py-4 border-t border-slate-100">
                    <Link
                        href={clienteLogueado ? '/cuenta/pedidos' : '/cuenta/login'}
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-950 transition-colors duration-200 ease-in-out"
                    >
                        <UserIcon className="w-4 h-4" />
                        {clienteLogueado ? 'Mi cuenta' : 'Ingresar a mi cuenta'}
                    </Link>
                </div>
            </div>
        </>
    )
}
