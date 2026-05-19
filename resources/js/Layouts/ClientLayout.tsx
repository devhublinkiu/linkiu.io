import { type ReactNode } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { CartProvider } from '@/contexts/CartContext'
import AnnouncementBar from '@/Components/public/navbar/parts/AnnouncementBar'
import Navbar from '@/Components/public/navbar'
import { Toaster } from '@/Components/ui/Sonner'

interface SharedProps {
    auth: {
        client: { id: number; nombre: string; apellido: string; email: string } | null
    }
    [key: string]: unknown
}

const TABS = [
    { key: 'pedidos',     label: 'Mis pedidos',    routeName: 'cuenta.pedidos' },
    { key: 'perfil',      label: 'Mi perfil',       routeName: 'cuenta.perfil' },
    { key: 'direcciones', label: 'Mis direcciones', routeName: 'cuenta.direcciones' },
    { key: 'seguridad',   label: 'Seguridad',       routeName: 'cuenta.seguridad' },
]

interface Props {
    children: ReactNode
    tab: string
    title?: string
}

export default function ClientLayout({ children, tab, title }: Props) {
    const { auth } = usePage<SharedProps>().props

    function cerrarSesion() {
        router.post(route('cuenta.logout'))
    }

    return (
        <CartProvider>
            {title && <Head title={title} />}
            <AnnouncementBar />
            <Navbar />
            <main className="bg-slate-50 min-h-[80vh] pb-16">
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center justify-between pt-5 pb-3">
                            <div>
                                <p className="text-[11px] text-slate-400 mb-0.5">Mi cuenta</p>
                                <p className="text-sm font-semibold text-slate-900">
                                    {auth.client?.nombre} {auth.client?.apellido}
                                </p>
                            </div>
                            <button
                                onClick={cerrarSesion}
                                className="text-xs text-slate-400 hover:text-slate-600 transition-colors duration-200"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                        <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {TABS.map(t => (
                                <Link
                                    key={t.key}
                                    href={route(t.routeName)}
                                    className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors duration-200 ${
                                        tab === t.key
                                            ? 'border-slate-900 text-slate-900'
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {t.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                    {children}
                </div>
            </main>
            <Toaster />
        </CartProvider>
    )
}
