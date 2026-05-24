import { useMemo, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { ChevronDownIcon, XIcon, UserIcon } from 'lucide-react'
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

interface MobileMenuProps {
    open:            boolean
    onClose:         () => void
    clienteLogueado: boolean
}

export default function MobileMenu({ open, onClose, clienteLogueado }: MobileMenuProps) {
    const { build } = usePage<{
        build?: { logo_tienda?: string | null; nav?: NavConfig }
    }>().props

    const nav     = build?.nav
    const logoSrc = build?.logo_tienda || '/assets/build_resources/logo_default_admin.svg'

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
