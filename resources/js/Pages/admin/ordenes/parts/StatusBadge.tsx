import { cn } from '@/lib/utils'

export type Estado = 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'

const CONFIG: Record<Estado, { label: string; className: string }> = {
    pendiente:  { label: 'Pendiente',   className: 'bg-slate-100 text-slate-600' },
    confirmado: { label: 'Confirmado',  className: 'bg-blue-50 text-blue-600' },
    preparando: { label: 'Preparando',  className: 'bg-amber-50 text-amber-600' },
    enviado:    { label: 'Enviado',     className: 'bg-orange-50 text-orange-600' },
    entregado:  { label: 'Entregado',   className: 'bg-emerald-50 text-emerald-600' },
    cancelado:  { label: 'Cancelado',   className: 'bg-red-50 text-red-500' },
}

interface Props {
    estado: Estado
    className?: string
}

export default function StatusBadge({ estado, className }: Props) {
    const cfg = CONFIG[estado] ?? { label: estado, className: 'bg-slate-100 text-slate-500' }
    return (
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', cfg.className, className)}>
            {cfg.label}
        </span>
    )
}
