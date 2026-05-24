import { cn } from '@/lib/utils'

interface Props {
    name:       string
    size?:      'sm' | 'md' | 'lg'
    className?: string
}

const SIZE_CLASSES = {
    sm: 'size-7 text-xs',
    md: 'size-8 text-xs',
    lg: 'size-10 text-sm',
} as const

/**
 * Avatar circular con iniciales derivadas del nombre — sin imagen.
 * Para avatars con imagen + fallback, usar el `Avatar` shadcn.
 *
 * Lógica de iniciales:
 *  - 1 palabra: primeras 2 letras
 *  - 2+ palabras: primera letra de las 2 primeras
 */
export function InitialsAvatar({ name, size = 'md', className }: Props) {
    const partes = name.trim().split(/\s+/)
    const letras = partes.length >= 2
        ? partes[0][0] + partes[1][0]
        : partes[0].slice(0, 2)

    return (
        <div className={cn(
            'flex shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold uppercase text-slate-600',
            SIZE_CLASSES[size],
            className,
        )}>
            {letras}
        </div>
    )
}
