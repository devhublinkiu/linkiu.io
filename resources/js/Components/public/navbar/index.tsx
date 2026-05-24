import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { ChevronDownIcon, MenuIcon, SearchIcon, ShoppingCartIcon, UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import SearchDropdown from './parts/SearchDropdown'
import MegaMenu from './parts/MegaMenu'
import MobileMenu from './parts/MobileMenu'
import CartDropdown from './parts/CartDropdown'

interface NavConfig {
    productos_label:  string
    quienes_label:    string
    blog_label:       string
    contacto_label:   string
    quienes_visible:  boolean
    blog_visible:     boolean
    contacto_visible: boolean
    buscador_visible: boolean
    color_bg:         string
    color_text:       string
    sticky:           boolean
}

interface Colores {
    primario:   string
    secundario: string
    acento:     string
}

export default function Navbar() {
    const { count } = useCart()
    const { auth, build } = usePage<{
        auth:   { client: { nombre: string } | null }
        build?: { logo_tienda?: string | null; nav?: NavConfig; colores?: Colores }
    }>().props

    const nav     = build?.nav
    const logoSrc = build?.logo_tienda || '/assets/build_resources/logo_default_admin.svg'

    const colores = build?.colores ?? { primario: '#314158', secundario: '#62748E', acento: '#FB2C36' }

    function resolverColor(token: string): string {
        if (token === 'primario')   return colores.primario
        if (token === 'secundario') return colores.secundario
        if (token === 'acento')     return colores.acento
        if (token === 'blanco')     return '#FFFFFF'
        return '#000000'
    }

    const navBg   = resolverColor(nav?.color_bg   ?? 'blanco')
    const navText = resolverColor(nav?.color_text  ?? 'primario')

    const linksSimples = useMemo(() => {
        const links: { label: string; href: string }[] = []
        if (nav?.quienes_visible  ?? true) links.push({ label: nav?.quienes_label  ?? 'Quiénes Somos', href: route('about')      })
        if (nav?.blog_visible     ?? true) links.push({ label: nav?.blog_label     ?? 'Blog',          href: route('blog.index') })
        if (nav?.contacto_visible ?? true) links.push({ label: nav?.contacto_label ?? 'Contacto',      href: route('contact')    })
        return links
    }, [nav])

    const productosLabel  = nav?.productos_label  ?? 'Productos'
    const buscadorVisible = nav?.buscador_visible ?? true
    const esSticky        = nav?.sticky           ?? true

    const clienteLogueado = !!auth?.client

    const [searchAbierto,    setSearchAbierto]    = useState(false)
    const [megaMenuAbierto,  setMegaMenuAbierto]  = useState(false)
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
    const [carritoAbierto,   setCarritoAbierto]   = useState(false)
    const [badgeBumping,     setBadgeBumping]     = useState(false)
    const searchAnchorRef = useRef<HTMLButtonElement>(null)
    const cartAnchorRef   = useRef<HTMLButtonElement>(null)
    const timerCierreRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
    const prevCount       = useRef(count)

    useEffect(() => {
        if (count > prevCount.current) {
            setBadgeBumping(true)
            const t = setTimeout(() => setBadgeBumping(false), 400)
            prevCount.current = count
            return () => clearTimeout(t)
        }
        prevCount.current = count
    }, [count])

    const abrirMegaMenu = useCallback(() => {
        if (timerCierreRef.current) clearTimeout(timerCierreRef.current)
        setMegaMenuAbierto(true)
    }, [])

    const cerrarMegaMenu = useCallback(() => {
        timerCierreRef.current = setTimeout(() => setMegaMenuAbierto(false), 150)
    }, [])

    return (
        <>
            <nav
                className={cn('border-b border-slate-200 relative', esSticky && 'sticky top-0 z-40')}
                style={{ backgroundColor: navBg }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4" style={{ color: navText }}>

                    {/* Logo */}
                    <Link href="/" className="shrink-0">
                        <img
                            src={logoSrc}
                            alt="Logo"
                            className="h-7 sm:h-8 w-auto"
                            onError={e => { e.currentTarget.src = '/assets/build_resources/logo_default_admin.svg' }}
                        />
                    </Link>

                    {/* Links desktop */}
                    <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
                        <Link
                            href="/"
                            className="text-sm font-medium transition-opacity duration-200 ease-in-out hover:opacity-70"
                        >
                            Inicio
                        </Link>

                        <div onMouseEnter={abrirMegaMenu} onMouseLeave={cerrarMegaMenu}>
                            <button className="flex items-center gap-1 text-sm font-medium transition-opacity duration-200 ease-in-out hover:opacity-70">
                                {productosLabel}
                                <ChevronDownIcon className={cn(
                                    'w-3.5 h-3.5 transition-transform duration-200',
                                    megaMenuAbierto && 'rotate-180',
                                )} />
                            </button>
                        </div>

                        {linksSimples.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium transition-opacity duration-200 ease-in-out hover:opacity-70"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Íconos de acción */}
                    <div className="flex items-center gap-1 relative">

                        {/* Búsqueda */}
                        {buscadorVisible && (
                            <>
                                <button
                                    ref={searchAnchorRef}
                                    onClick={() => setSearchAbierto(prev => !prev)}
                                    className="p-2 rounded-lg hover:opacity-70 hover:bg-black/5 transition-all duration-200 ease-in-out"
                                    aria-label="Buscar productos"
                                >
                                    <SearchIcon className="w-5 h-5" />
                                </button>
                                <SearchDropdown
                                    open={searchAbierto}
                                    onClose={() => setSearchAbierto(false)}
                                    anchorRef={searchAnchorRef}
                                />
                            </>
                        )}

                        {/* Cuenta / Ingresar — solo desktop */}
                        <Link
                            href={clienteLogueado ? '/cuenta/pedidos' : '/cuenta/login'}
                            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:opacity-70 hover:bg-black/5 transition-all duration-200 ease-in-out"
                        >
                            <UserIcon className="w-5 h-5" />
                            {clienteLogueado ? 'Mi cuenta' : 'Ingresar'}
                        </Link>

                        {/* Carrito */}
                        <button
                            ref={cartAnchorRef}
                            onClick={() => setCarritoAbierto(prev => !prev)}
                            className="p-2 rounded-lg hover:opacity-70 hover:bg-black/5 transition-all duration-200 ease-in-out"
                            aria-label="Ver carrito"
                        >
                            <div className="relative">
                                <ShoppingCartIcon className="w-5 h-5" />
                                {count > 0 && (
                                    <span className={cn(
                                        'absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none',
                                        badgeBumping && 'animate-cart-bump',
                                    )}>
                                        {count}
                                    </span>
                                )}
                            </div>
                        </button>
                        <CartDropdown
                            open={carritoAbierto}
                            onClose={() => setCarritoAbierto(false)}
                            anchorRef={cartAnchorRef}
                        />

                        {/* Hamburger — solo móvil */}
                        <button
                            onClick={() => setMenuMovilAbierto(true)}
                            className="md:hidden p-2 rounded-lg hover:opacity-70 hover:bg-black/5 transition-all duration-200 ease-in-out"
                            aria-label="Abrir menú"
                        >
                            <MenuIcon className="w-5 h-5" />
                        </button>

                    </div>
                </div>

                {/* Megamenú desktop */}
                {megaMenuAbierto && (
                    <div
                        className="absolute left-0 right-0 top-full z-40 hidden md:block"
                        onMouseEnter={abrirMegaMenu}
                        onMouseLeave={cerrarMegaMenu}
                    >
                        <MegaMenu />
                    </div>
                )}
            </nav>

            <MobileMenu
                open={menuMovilAbierto}
                onClose={() => setMenuMovilAbierto(false)}
                clienteLogueado={clienteLogueado}
            />
        </>
    )
}
