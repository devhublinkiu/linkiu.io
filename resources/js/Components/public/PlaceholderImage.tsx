import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
    /** Texto opcional debajo del ícono. Ej: "Imagen del producto" */
    label?:    string
    /** Tamaño del ícono. Default 'md' = size-8. */
    iconSize?: 'sm' | 'md' | 'lg'
    /** Clases extra (forma, dimensiones, etc.). El placeholder es por defecto rounded-2xl. */
    className?: string
}

/**
 * Placeholder visual estilo wireframe para slots de imagen sin configurar.
 *
 * Coherente con el placeholder del logo (slate, borde discontinuo) — comunica
 * al cliente que el slot es configurable sin engañar con contenido falso.
 *
 * Uso: <PlaceholderImage label="Foto del producto" className="aspect-square" />
 */
export default function PlaceholderImage({ label, iconSize = 'md', className }: Props) {
    const iconClass = iconSize === 'sm' ? 'size-5' : iconSize === 'lg' ? 'size-12' : 'size-8'

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 w-full h-full',
                className,
            )}
        >
            <ImageIcon className={iconClass} strokeWidth={1.5} />
            {label && <span className="text-xs font-medium uppercase tracking-wider">{label}</span>}
        </div>
    )
}
