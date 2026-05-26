import React from 'react'
import { cn } from '@/lib/utils'

export interface BotonCompraConfig {
    texto?:            string | null
    emoji?:            string | null
    mostrar_total?:    boolean
    estilo_fondo?:     'solido' | 'gradiente'
    color_fondo?:      string | null
    color_fondo_2?:    string | null
    color_texto?:      string | null
    aplicar_a_sticky?: boolean
}

interface Props {
    config?:         BotonCompraConfig | null
    activo?:         boolean
    precio:          number | null
    formatPrecio:    (n: number) => string
    onClick:         () => void
    className?:      string
    sticky?:         boolean
}

const DEFAULTS_TEXTO = 'Comprar ahora'

const BotonCompra = React.forwardRef<HTMLButtonElement, Props>(function BotonCompra(
    { config, activo, precio, formatPrecio, onClick, className, sticky = false },
    ref,
) {
    const useConfig = activo && config && (!sticky || config.aplicar_a_sticky !== false)

    const texto         = useConfig ? (config?.texto         || DEFAULTS_TEXTO) : DEFAULTS_TEXTO
    const emoji         = useConfig ? (config?.emoji ?? null)                   : '🛒'
    const mostrarTotal  = useConfig ? (config?.mostrar_total ?? true)           : true
    const estiloFondo   = useConfig ? (config?.estilo_fondo  ?? 'gradiente')    : 'gradiente'
    const colorFondo    = useConfig ? (config?.color_fondo   ?? '#F59E0B')      : null
    const colorFondo2   = useConfig ? (config?.color_fondo_2 ?? '#F97316')      : null
    const colorTexto    = useConfig ? (config?.color_texto   ?? '#FFFFFF')      : null

    const style = useConfig
        ? {
            background: estiloFondo === 'gradiente' && colorFondo && colorFondo2
                ? `linear-gradient(to right, ${colorFondo}, ${colorFondo2})`
                : (colorFondo ?? '#F59E0B'),
            color: colorTexto ?? '#FFFFFF',
        }
        : undefined

    const baseDefault = 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
    const padding     = sticky ? 'py-3.5' : 'py-4'

    return (
        <button
            ref={ref}
            onClick={onClick}
            style={style}
            className={cn(
                'w-full text-base font-bold rounded-lg transition-all duration-200 ease-in-out',
                padding,
                !useConfig && baseDefault,
                sticky && 'animate-cta-pulse',
                className,
            )}
        >
            {emoji && <span className="mr-1.5">{emoji}</span>}
            {texto}
            {mostrarTotal && (
                <span> — {precio != null ? formatPrecio(precio) : '—'}</span>
            )}
        </button>
    )
})

export default BotonCompra
