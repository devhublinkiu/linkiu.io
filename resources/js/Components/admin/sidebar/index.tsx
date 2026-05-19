import { useState, useMemo } from 'react'
import {
    LayoutDashboard, Package, Tag, ShoppingCart, Users, Ticket,
    Hammer, Webhook, FileText, Shield, ShieldCheck, UserCog, BarChart2, Plug, Languages,
    ChevronLeft, ChevronRight,
    Flame, MousePointer, Video,
    Wallet, CreditCard, Sparkles, Truck, Crosshair,
} from 'lucide-react'
import { usePage } from '@inertiajs/react'
import { TooltipProvider } from '@/Components/ui/Tooltip'
import NavItem from './parts/NavItem'
import NavGroup, { NavGroupChild } from './parts/NavGroup'

interface NavDirectItem {
    type: 'item'
    label: string
    icon: React.ComponentType<{ className?: string }>
    routeName: string | null
    permiso?: string | null
}

interface NavExpandableItem {
    type: 'group'
    label: string
    icon: React.ComponentType<{ className?: string }>
    children: NavGroupChild[]
}

type NavEntry = NavDirectItem | NavExpandableItem

const NAV: NavEntry[] = [
    { type: 'item',  label: 'Dashboard',        icon: LayoutDashboard, routeName: 'admin.dashboard' },
    { type: 'item',  label: 'Productos',         icon: Package,         routeName: 'admin.productos.index', permiso: 'productos.ver' },
    { type: 'item',  label: 'Categorías',        icon: Tag,             routeName: 'admin.categorias.index', permiso: 'categorias.ver' },
    { type: 'item',  label: 'Órdenes',           icon: ShoppingCart,    routeName: 'admin.ordenes.index', permiso: 'ordenes.ver' },
    { type: 'item',  label: 'Clientes',          icon: Users,           routeName: 'admin.clientes.index', permiso: 'clientes.ver' },
    { type: 'item',  label: 'Cupones',           icon: Ticket,          routeName: null },
    { type: 'item',  label: 'Métodos de pago',   icon: CreditCard,      routeName: 'admin.metodos-pago.index', permiso: 'metodos-pago.ver' },
    { type: 'item',  label: 'Métodos de envío',  icon: Truck,           routeName: 'admin.envio.index', permiso: 'envio.ver' },
    { type: 'item',  label: 'LinkiuBuild',       icon: Hammer,          routeName: null },
    { type: 'item',  label: 'Webhooks',          icon: Webhook,         routeName: null },
    { type: 'item',  label: 'Blogs',             icon: FileText,        routeName: null },
    {
        type: 'group',
        label: 'Roles y permisos',
        icon: Shield,
        children: [
            { label: 'Roles',    icon: ShieldCheck, routeName: 'admin.roles.index', permiso: 'roles.ver' },
            { label: 'Usuarios', icon: UserCog,     routeName: 'admin.usuarios.index', permiso: 'usuarios.ver' },
        ],
    },
    {
        type: 'group',
        label: 'Analytics',
        icon: BarChart2,
        children: [
            { label: 'Firemaps',    icon: Flame,        routeName: null },
            { label: 'Scrollink',   icon: MousePointer, routeName: null },
            { label: 'RecordLink',  icon: Video,        routeName: null },
        ],
    },
    {
        type: 'group',
        label: 'Integraciones',
        icon: Plug,
        children: [
            { label: 'Pasarelas de pago', icon: Wallet,    routeName: 'admin.integraciones.pasarelas', permiso: 'integraciones.ver' },
            { label: 'Pixeles ADS',       icon: Crosshair, routeName: 'admin.integraciones.pixeles',   permiso: 'integraciones.ver' },
            { label: 'IA API',            icon: Sparkles,  routeName: null },
        ],
    },
    { type: 'item',  label: 'Traducciones',      icon: Languages,       routeName: null },
]

interface Props {
    collapsed: boolean
    onToggleCollapse: () => void
    logoUrl?: string | null
}

export default function Sidebar({ collapsed, onToggleCollapse, logoUrl }: Props) {
    const { auth } = usePage<{ auth: { permissions: string[] } }>().props

    const puede = (permiso?: string | null): boolean => {
        if (!permiso) return true
        if (auth.permissions.includes('*')) return true
        return auth.permissions.includes(permiso)
    }

    const visibleNAV = useMemo(() => NAV.flatMap(entry => {
        if (entry.type === 'item') {
            return puede(entry.permiso) ? [entry] : []
        }
        const visibleChildren = entry.children.filter(c => puede(c.permiso))
        return visibleChildren.length > 0 ? [{ ...entry, children: visibleChildren }] : []
    }), [auth.permissions])

    const initialOpenGroup = useMemo(() => {
        for (const entry of visibleNAV) {
            if (entry.type !== 'group') continue
            const hasActive = entry.children.some(child => {
                if (!child.routeName) return false
                try { return !!route().current(child.routeName) } catch { return false }
            })
            if (hasActive) return entry.label
        }
        return null
    }, [])

    const [openGroup, setOpenGroup] = useState<string | null>(initialOpenGroup)

    const handleGroupToggle = (label: string, children: NavGroupChild[]) => {
        const hasActiveChild = children.some(child => {
            if (!child.routeName) return false
            try { return !!route().current(child.routeName) } catch { return false }
        })

        if (hasActiveChild) return

        setOpenGroup(prev => prev === label ? null : label)
    }

    return (
        <TooltipProvider delayDuration={200}>
            <div className="flex h-full flex-col">

                {/* Logo */}
                <div className={`flex shrink-0 items-center border-b border-slate-200 py-4 ${collapsed ? 'justify-center px-3' : 'justify-between px-4'}`}>
                    {!collapsed && (
                        <img
                            src={logoUrl ?? '/assets/build_resources/logo_default_admin.svg'}
                            alt="Logo"
                            className="h-10 w-auto object-contain"
                        />
                    )}
                    <button
                        onClick={onToggleCollapse}
                        className="rounded-md p-1.5 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-600"
                        title={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
                    >
                        {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                    </button>
                </div>

                {/* Navegación */}
                <nav className="flex-1 overflow-y-auto px-2 py-3">
                    <div className="space-y-0.5">
                        {visibleNAV.map(entry => {
                            if (entry.type === 'item') {
                                return (
                                    <NavItem
                                        key={entry.label}
                                        label={entry.label}
                                        icon={entry.icon}
                                        routeName={entry.routeName}
                                        collapsed={collapsed}
                                    />
                                )
                            }

                            return (
                                <NavGroup
                                    key={entry.label}
                                    label={entry.label}
                                    icon={entry.icon}
                                    children={entry.children}
                                    collapsed={collapsed}
                                    isOpen={openGroup === entry.label}
                                    onToggle={() => handleGroupToggle(entry.label, entry.children)}
                                />
                            )
                        })}
                    </div>
                </nav>

            </div>
        </TooltipProvider>
    )
}
