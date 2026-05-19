import { type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export default function PrimaryButton({ className, disabled, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={cn(
                'inline-flex items-center rounded-lg border border-transparent bg-slate-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 ease-in-out hover:bg-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400',
                className
            )}
        >
            {children}
        </button>
    )
}
