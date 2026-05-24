import { CreditCard } from 'lucide-react'
import { Badge } from '@/Components/ui/Badge'

interface Props {
    nombre:      string
    descripcion: string
}

/**
 * Card para pasarelas aún no implementadas (Wompi, PayU, ePayco...).
 * Visualmente atenuada con `opacity-60` y bloqueada con `pointer-events-none`.
 */
export function ComingSoonCard({ nombre, descripcion }: Props) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 opacity-60 pointer-events-none select-none">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    <CreditCard className="size-4 text-slate-500" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-semibold text-slate-900">{nombre}</h3>
                        <Badge variant="secondary">Próximamente</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{descripcion}</p>
                </div>
            </div>
        </div>
    )
}
