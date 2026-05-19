import { Link } from '@inertiajs/react'
import { Menu, ChevronRight } from 'lucide-react'
import NotificationsDropdown from './parts/NotificationsDropdown'
import UserDropdown from './parts/UserDropdown'

export interface Breadcrumb {
    label: string
    href?: string
}

interface Props {
    titulo?: string
    breadcrumbs?: Breadcrumb[]
    onMobileMenuOpen: () => void
}

export default function Navbar({ titulo, breadcrumbs, onMobileMenuOpen }: Props) {
    const tieneBreadcrumbs = breadcrumbs && breadcrumbs.length > 0

    return (
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">

            {/* Izquierda: menú móvil + título o breadcrumbs */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMobileMenuOpen}
                    className="rounded-md p-1.5 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
                >
                    <Menu className="size-5" />
                </button>

                {tieneBreadcrumbs ? (
                    <nav className="flex items-center gap-1.5 text-sm">
                        {breadcrumbs.map((crumb, i) => {
                            const esUltimo = i === breadcrumbs.length - 1
                            return (
                                <span key={i} className="flex items-center gap-1.5">
                                    {i > 0 && <ChevronRight className="size-3.5 text-slate-300" />}
                                    {esUltimo || !crumb.href ? (
                                        <span className={esUltimo ? 'font-medium text-slate-900' : 'text-slate-400'}>
                                            {crumb.label}
                                        </span>
                                    ) : (
                                        <Link
                                            href={crumb.href}
                                            className="text-slate-400 transition-colors duration-200 hover:text-slate-700"
                                        >
                                            {crumb.label}
                                        </Link>
                                    )}
                                </span>
                            )
                        })}
                    </nav>
                ) : titulo ? (
                    <h1 className="text-base font-semibold text-slate-900">{titulo}</h1>
                ) : null}
            </div>

            {/* Derecha: notificaciones + usuario */}
            <div className="flex items-center gap-1">
                <NotificationsDropdown />
                <UserDropdown />
            </div>

        </header>
    )
}
