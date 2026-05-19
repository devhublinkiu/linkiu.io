import { useState } from 'react'
import { Link } from '@inertiajs/react'
import { ChevronDownIcon, XIcon, UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIAS_MOVIL = [
    { label: 'Cubre Canas', href: '/productos/cubre-canas' },
    { label: 'Tratamientos', href: '/productos/tratamientos' },
    { label: 'Hidratación', href: '/productos/hidratacion' },
    { label: 'Anticaída', href: '/productos/anticaida' },
    { label: 'Kits y Sets', href: '/productos/kits' },
]

const LINKS_MOVIL = [
    { label: 'Inicio', href: '/' },
    { label: 'Quiénes Somos', href: '/quienes-somos' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contacto', href: '/contacto' },
]

interface MobileMenuProps {
    open: boolean
    onClose: () => void
    clienteLogueado: boolean
}

export default function MobileMenu({ open, onClose, clienteLogueado }: MobileMenuProps) {
    const [productosAbierto, setProductosAbierto] = useState(false)

    return (
        <>
            {/* Overlay oscuro */}
            <div
                className={cn(
                    'fixed inset-0 bg-slate-900/50 z-40 transition-opacity duration-300 ease-in-out md:hidden',
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* Panel lateral */}
            <div
                className={cn(
                    'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 flex flex-col shadow-xl transition-transform duration-300 ease-in-out md:hidden',
                    open ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Cabecera del panel */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <img
                        src="/assets/logo full linkiu.svg"
                        alt="Linkiu"
                        className="h-6 w-auto"
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
                            Productos
                            <ChevronDownIcon className={cn(
                                'w-4 h-4 text-slate-400 transition-transform duration-200',
                                productosAbierto && 'rotate-180'
                            )} />
                        </button>
                        {productosAbierto && (
                            <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-slate-100 pl-3">
                                {CATEGORIAS_MOVIL.map(cat => (
                                    <Link
                                        key={cat.href}
                                        href={cat.href}
                                        onClick={onClose}
                                        className="px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200 ease-in-out"
                                    >
                                        {cat.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {LINKS_MOVIL.slice(1).map(link => (
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
