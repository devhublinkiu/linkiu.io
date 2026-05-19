import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { ChevronDownIcon, MenuIcon, SearchIcon, ShoppingCartIcon, UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import SearchDropdown from './parts/SearchDropdown'
import MegaMenu from './parts/MegaMenu'
import MobileMenu from './parts/MobileMenu'
import CartDropdown from './parts/CartDropdown'

const LINKS_SIMPLES = [
    { label: 'Quiénes Somos', href: '/quienes-somos' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contacto', href: '/contacto' },
]

export default function Navbar() {
    const { count } = useCart()
    const { auth } = usePage<{ auth: { client: { nombre: string } | null } }>().props
    const clienteLogueado = !!auth?.client
    const [searchAbierto, setSearchAbierto] = useState(false)
    const [megaMenuAbierto, setMegaMenuAbierto] = useState(false)
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
    const [carritoAbierto, setCarritoAbierto] = useState(false)
    const [badgeBumping, setBadgeBumping] = useState(false)
    const searchAnchorRef = useRef<HTMLButtonElement>(null)
    const cartAnchorRef = useRef<HTMLButtonElement>(null)
    const timerCierreRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const prevCount = useRef(count)

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
            <nav className="bg-white border-b border-slate-200 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

                    {/* Logo */}
                    <Link href="/" className="shrink-0">
                        <img
                            src="/assets/logo full linkiu.svg"
                            alt="Linkiu"
                            className="h-7 sm:h-8 w-auto"
                        />
                    </Link>

                    {/* Links desktop */}
                    <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
                        <Link
                            href="/"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 ease-in-out"
                        >
                            Inicio
                        </Link>

                        <div onMouseEnter={abrirMegaMenu} onMouseLeave={cerrarMegaMenu}>
                            <button className={cn(
                                'flex items-center gap-1 text-sm font-medium transition-colors duration-200 ease-in-out',
                                megaMenuAbierto ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                            )}>
                                Productos
                                <ChevronDownIcon className={cn(
                                    'w-3.5 h-3.5 transition-transform duration-200',
                                    megaMenuAbierto && 'rotate-180'
                                )} />
                            </button>
                        </div>

                        {LINKS_SIMPLES.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 ease-in-out"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Íconos de acción */}
                    <div className="flex items-center gap-1 relative">

                        {/* Búsqueda */}
                        <button
                            ref={searchAnchorRef}
                            onClick={() => setSearchAbierto(prev => !prev)}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200 ease-in-out"
                            aria-label="Buscar productos"
                        >
                            <SearchIcon className="w-5 h-5" />
                        </button>
                        <SearchDropdown
                            open={searchAbierto}
                            onClose={() => setSearchAbierto(false)}
                            anchorRef={searchAnchorRef}
                        />

                        {/* Cuenta / Ingresar — solo desktop */}
                        <Link
                            href={clienteLogueado ? '/cuenta/pedidos' : '/cuenta/login'}
                            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200 ease-in-out"
                        >
                            <UserIcon className="w-5 h-5" />
                            {clienteLogueado ? 'Mi cuenta' : 'Ingresar'}
                        </Link>

                        {/* Carrito */}
                        <button
                            ref={cartAnchorRef}
                            onClick={() => setCarritoAbierto(prev => !prev)}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200 ease-in-out"
                            aria-label="Ver carrito"
                        >
                            <div className="relative">
                                <ShoppingCartIcon className="w-5 h-5" />
                                {count > 0 && (
                                    <span className={cn(
                                        'absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none',
                                        badgeBumping && 'animate-cart-bump'
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
                            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200 ease-in-out"
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
