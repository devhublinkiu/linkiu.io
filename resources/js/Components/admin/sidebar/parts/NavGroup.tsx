import { useState } from 'react'
import { Link } from '@inertiajs/react'
import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/Popover'

export interface NavGroupChild {
    label: string
    icon: LucideIcon
    routeName: string | null
    permiso?: string | null
}

interface Props {
    label: string
    icon: LucideIcon
    children: NavGroupChild[]
    collapsed: boolean
    isOpen: boolean
    onToggle: () => void
}

function activeChild(routeName: string | null): boolean {
    if (!routeName) return false
    try { return !!route().current(routeName) } catch { return false }
}

export default function NavGroup({ label, icon: Icon, children, collapsed, isOpen, onToggle }: Props) {
    const [popoverOpen, setPopoverOpen] = useState(false)

    const hasActiveChild = children.some(c => activeChild(c.routeName))

    // ── Colapsado: Popover flotante ──────────────────────────────────────────
    if (collapsed) {
        return (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger
                    className={`flex w-full justify-center rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                        hasActiveChild
                            ? 'font-medium text-slate-900'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                    <Icon className="size-4 shrink-0" />
                </PopoverTrigger>

                <PopoverContent side="right" sideOffset={8} align="start" className="w-44 p-1.5">
                    <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
                        {label}
                    </p>
                    <div className="space-y-0.5">
                        {children.map(({ label: childLabel, icon: ChildIcon, routeName }) => {
                            const isActive = activeChild(routeName)

                            if (!routeName) {
                                return (
                                    <span
                                        key={childLabel}
                                        className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-300"
                                    >
                                        <ChildIcon className="size-3.5 shrink-0" />
                                        <span>{childLabel}</span>
                                    </span>
                                )
                            }

                            return (
                                <Link
                                    key={childLabel}
                                    href={route(routeName)}
                                    onClick={() => setPopoverOpen(false)}
                                    className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors duration-200 ${
                                        isActive
                                            ? 'bg-slate-100 font-medium text-slate-900'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <ChildIcon className="size-3.5 shrink-0" />
                                    <span>{childLabel}</span>
                                </Link>
                            )
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        )
    }

    // ── Expandido: acordeón ──────────────────────────────────────────────────
    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                    hasActiveChild
                        ? 'font-medium text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                <ChevronDown
                    className={`size-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {isOpen && (
                <div className="mt-0.5 space-y-0.5 pl-7">
                    {children.map(({ label: childLabel, icon: ChildIcon, routeName }) => {
                        const isActive = activeChild(routeName)

                        if (!routeName) {
                            return (
                                <span
                                    key={childLabel}
                                    className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300"
                                >
                                    <ChildIcon className="size-3.5 shrink-0" />
                                    <span>{childLabel}</span>
                                </span>
                            )
                        }

                        return (
                            <Link
                                key={childLabel}
                                href={route(routeName)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
                                    isActive
                                        ? 'bg-slate-100 font-medium text-slate-900'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <ChildIcon className="size-3.5 shrink-0" />
                                <span>{childLabel}</span>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
