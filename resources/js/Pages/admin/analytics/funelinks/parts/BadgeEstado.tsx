import { Badge } from '@/Components/ui/Badge'

interface Props {
    estado: 'bueno' | 'medio' | 'bajo'
}

const CONFIG = {
    bueno: { className: 'bg-emerald-50 text-emerald-700', label: 'Bueno' },
    medio: { className: 'bg-amber-50 text-amber-700',     label: 'Medio' },
    bajo:  { className: 'bg-red-50 text-red-700',          label: 'Bajo'  },
} as const

/**
 * Pill para indicar la salud de una fila (origen o dispositivo) en
 * las tablas comparativas de Funelinks. Color por banda de conversion.
 */
export function BadgeEstado({ estado }: Props) {
    const c = CONFIG[estado]
    return (
        <Badge variant="secondary" className={c.className}>
            {c.label}
        </Badge>
    )
}
