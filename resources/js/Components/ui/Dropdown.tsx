import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, type InertiaLinkProps } from '@inertiajs/react'
import { cn } from '@/lib/utils'

interface DropdownContextValue {
    open: boolean
    toggle: () => void
    close: () => void
}

const DropdownContext = createContext<DropdownContextValue>({
    open: false,
    toggle: () => {},
    close: () => {},
})

function DropdownRoot({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickFuera = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickFuera)
        return () => document.removeEventListener('mousedown', handleClickFuera)
    }, [])

    return (
        <DropdownContext.Provider value={{ open, toggle: () => setOpen(p => !p), close: () => setOpen(false) }}>
            <div ref={ref} className="relative">
                {children}
            </div>
        </DropdownContext.Provider>
    )
}

function Trigger({ children }: { children: ReactNode }) {
    const { toggle } = useContext(DropdownContext)
    return <div onClick={toggle}>{children}</div>
}

const WIDTH_CLASSES: Record<string, string> = {
    '48': 'w-48',
    '56': 'w-56',
    '64': 'w-64',
}

function Content({ align = 'right', width = '48', children }: { align?: 'left' | 'right'; width?: string; children: ReactNode }) {
    const { open } = useContext(DropdownContext)
    if (!open) return null

    return (
        <div className={cn(
            'absolute z-50 mt-2 rounded-lg border border-slate-200 bg-white shadow-md',
            WIDTH_CLASSES[width] ?? 'w-48',
            align === 'right' ? 'right-0' : 'left-0'
        )}>
            <div className="py-1">{children}</div>
        </div>
    )
}

function DropdownLink({ className, children, ...props }: InertiaLinkProps) {
    const { close } = useContext(DropdownContext)
    return (
        <Link
            {...props}
            className={cn(
                'block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200 ease-in-out',
                className
            )}
            onClick={close}
        >
            {children}
        </Link>
    )
}

const Dropdown = Object.assign(DropdownRoot, {
    Trigger,
    Content,
    Link: DropdownLink,
})

export default Dropdown
