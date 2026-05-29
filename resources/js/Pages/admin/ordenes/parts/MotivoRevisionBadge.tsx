import { cn } from '@/lib/utils'

export type MotivoRevision = 'telefono_invalido' | 'monto_alto' | 'cliente_blacklist'

const CONFIG: Record<string, { label: string }> = {
    telefono_invalido: { label: 'Teléfono inválido' },
    monto_alto:        { label: 'Monto alto' },
    cliente_blacklist: { label: 'Cliente en blacklist' },
}

interface Props {
    motivo:     string
    className?: string
}

/**
 * Badge para mostrar un motivo de revisión antifraude. Sigue exactamente el
 * mismo patrón visual que StatusBadge (font-semibold + px-2.5 + sin border)
 * para que cuando aparezcan juntos en una celda se vean coherentes.
 *
 * Color amber porque representa una advertencia que requiere acción del admin.
 */
export default function MotivoRevisionBadge({ motivo, className }: Props) {
    const cfg = CONFIG[motivo] ?? { label: motivo }
    return (
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700', className)}>
            {cfg.label}
        </span>
    )
}
