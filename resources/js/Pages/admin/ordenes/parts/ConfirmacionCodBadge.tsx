import { cn } from '@/lib/utils'

export type EstadoConfirmacion =
    | 'esperando'           // solicitada, sin respuesta, dentro de 30min o ya reenviada
    | 'sin_respuesta'        // > 30min sin respuesta + ya reenviada (queda mostrarlo)
    | 'confirmado_cliente'   // cliente respondió "Sí"
    | 'cancelado_cliente'    // cliente respondió "No"

const CONFIG: Record<EstadoConfirmacion, { label: string; className: string }> = {
    esperando:          { label: 'Esperando respuesta',  className: 'bg-slate-100 text-slate-600' },
    sin_respuesta:      { label: 'Sin respuesta',        className: 'bg-slate-100 text-slate-500' },
    confirmado_cliente: { label: 'Confirmado por cliente', className: 'bg-emerald-50 text-emerald-700' },
    cancelado_cliente:  { label: 'Cancelado por cliente',  className: 'bg-red-50 text-red-500' },
}

interface Props {
    estado:     EstadoConfirmacion
    className?: string
}

/**
 * Badge del estado de la confirmación COD vía WhatsApp del cliente. Mismo
 * patrón visual que StatusBadge / MotivoRevisionBadge (font-semibold + px-2.5,
 * sin border) para que al lado del StatusBadge se vean coherentes.
 */
export default function ConfirmacionCodBadge({ estado, className }: Props) {
    const cfg = CONFIG[estado]
    return (
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', cfg.className, className)}>
            {cfg.label}
        </span>
    )
}

/**
 * Calcula el estado de confirmación de una orden COD a partir de sus campos.
 * Devuelve null si no aplica (no es COD, no se solicitó, etc.).
 */
export function calcularEstadoConfirmacion(orden: {
    metodo_pago:                 string
    confirmacion_solicitada_at:  string | null
    confirmacion_reenviada:      boolean
    confirmacion_respondida_at:  string | null
    confirmacion_respuesta:      'si' | 'no' | null
}): EstadoConfirmacion | null {
    if (orden.metodo_pago !== 'contraentrega') return null
    if (! orden.confirmacion_solicitada_at)    return null

    if (orden.confirmacion_respuesta === 'si') return 'confirmado_cliente'
    if (orden.confirmacion_respuesta === 'no') return 'cancelado_cliente'

    // Sin respuesta — la consideramos "sin_respuesta" solo si pasaron 30min Y ya
    // se reenvió (porque ya no se puede reenviar más). Si pasaron 30min y aún se
    // puede reenviar, mostramos "esperando" — el botón Reenviar es la CTA.
    //
    // 30min es el cooldown para evitar que el admin presione múltiples veces
    // y WhatsApp interprete el patrón como spam (riesgo de suspensión del
    // número incluso con check azul).
    const solicitadaMs    = new Date(orden.confirmacion_solicitada_at).getTime()
    const treintaMinAtras = Date.now() - 30 * 60 * 1000
    if (solicitadaMs < treintaMinAtras && orden.confirmacion_reenviada) {
        return 'sin_respuesta'
    }
    return 'esperando'
}

/**
 * Indica si el botón "Reenviar confirmación" debe ofrecerse en el Index.
 */
export function puedeReenviarConfirmacion(orden: {
    metodo_pago:                 string
    confirmacion_solicitada_at:  string | null
    confirmacion_reenviada:      boolean
    confirmacion_respondida_at:  string | null
}): boolean {
    if (orden.metodo_pago !== 'contraentrega') return false
    if (! orden.confirmacion_solicitada_at)    return false
    if (orden.confirmacion_reenviada)          return false
    if (orden.confirmacion_respondida_at)      return false

    const solicitadaMs    = new Date(orden.confirmacion_solicitada_at).getTime()
    const treintaMinAtras = Date.now() - 30 * 60 * 1000
    return solicitadaMs < treintaMinAtras
}
