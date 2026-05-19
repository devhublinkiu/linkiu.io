import { Link } from '@inertiajs/react'
import type { LucideIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/Tooltip'

interface Props {
    label: string
    icon: LucideIcon
    routeName: string | null
    collapsed: boolean
}

export default function NavItem({ label, icon: Icon, routeName, collapsed }: Props) {
    const isActive = routeName
        ? (() => { try { return !!route().current(routeName) } catch { return false } })()
        : false

    // Sin ruta — deshabilitado
    if (!routeName) {
        if (collapsed) {
            return (
                <Tooltip>
                    <TooltipTrigger className="flex w-full cursor-not-allowed justify-center rounded-lg px-3 py-2 text-sm text-slate-300">
                        <Icon className="size-4 shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>{label}</TooltipContent>
                </Tooltip>
            )
        }
        return (
            <span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300">
                <Icon className="size-4 shrink-0" />
                <span>{label}</span>
            </span>
        )
    }

    // Con ruta — colapsado
    if (collapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={route(routeName)}
                        className={`flex justify-center rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                            isActive
                                ? 'bg-slate-100 font-medium text-slate-900'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <Icon className="size-4 shrink-0" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>{label}</TooltipContent>
            </Tooltip>
        )
    }

    // Con ruta — expandido
    return (
        <Link
            href={route(routeName)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                isActive
                    ? 'bg-slate-100 font-medium text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
            <Icon className="size-4 shrink-0" />
            <span>{label}</span>
        </Link>
    )
}
