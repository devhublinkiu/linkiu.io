import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface CantidadPublica {
    cantidad:      number
    precio_bundle: number
    badge_texto:   string | null
    destacado:     boolean
    imagen:        string | null
}

export interface OpcionCantidad extends CantidadPublica {
    label:           string
    precioTachado:   number | null
    precioPorFrasco: number
    ahorroMonto:     number | null
    ahorrosPct:      number | null
}

interface Props {
    opciones:        OpcionCantidad[]
    cantidadActiva:  OpcionCantidad | null
    imagenPrincipal: string | null
    onSeleccionar:   (opcion: OpcionCantidad) => void
}

const PERSONAS_PROMO = [8, 12, 7, 15, 11, 9, 13, 6]

function usePersonasComprando() {
    const [idx, setIdx] = useState(0)
    const [key, setKey] = useState(0)
    useEffect(() => {
        const t = setInterval(() => {
            setIdx(i => (i + 1) % PERSONAS_PROMO.length)
            setKey(k => k + 1)
        }, 3500)
        return () => clearInterval(t)
    }, [])
    return { count: PERSONAS_PROMO[idx], key }
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

export default function SelectorCantidades({ opciones, cantidadActiva, imagenPrincipal, onSeleccionar }: Props) {
    const personas = usePersonasComprando()

    if (opciones.length === 0) return null

    return (
        <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Cantidad</p>
            <div className="flex flex-col gap-2.5">
                {opciones.map(opcion => {
                    const activo    = cantidadActiva?.cantidad === opcion.cantidad
                    const esShimmer = opcion.destacado

                    return (
                        <div key={opcion.cantidad} className="relative">

                            {opcion.badge_texto && (
                                <span className={cn(
                                    'absolute -top-2 left-4 z-10 text-[10px] font-bold text-white rounded-full px-2.5 py-0.5 pointer-events-none overflow-hidden',
                                    opcion.destacado ? 'animate-badge-shimmer' : 'bg-emerald-500'
                                )}>
                                    {opcion.badge_texto}
                                </span>
                            )}

                            <div className={cn(
                                'rounded-lg p-[2px] transition-all duration-200',
                                esShimmer && !activo
                                    ? 'animate-border-beam'
                                    : activo && (esShimmer || opcion.destacado)
                                    ? 'bg-emerald-700'
                                    : activo
                                    ? 'bg-slate-900'
                                    : 'bg-slate-200'
                            )}>
                                <button
                                    onClick={() => onSeleccionar(opcion)}
                                    className={cn(
                                        'flex items-center gap-4 px-4 py-3.5 rounded-[6px] w-full text-left transition-colors duration-200 ease-in-out',
                                        activo && (esShimmer || opcion.destacado)
                                            ? 'bg-emerald-500'
                                            : activo
                                            ? 'bg-slate-50'
                                            : 'bg-white hover:bg-slate-50'
                                    )}
                                >
                                    {/* Radio visual */}
                                    <div className={cn(
                                        'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                                        activo && (esShimmer || opcion.destacado) ? 'border-white'
                                            : activo ? 'border-slate-900'
                                            : 'border-slate-300'
                                    )}>
                                        {activo && (
                                            <div className={cn(
                                                'w-2 h-2 rounded-full',
                                                esShimmer || opcion.destacado ? 'bg-white' : 'bg-slate-900'
                                            )} />
                                        )}
                                    </div>

                                    {/* Imagen */}
                                    {(opcion.imagen ?? imagenPrincipal) && (
                                        <img
                                            src={opcion.imagen ?? imagenPrincipal!}
                                            alt=""
                                            className="h-10 w-auto object-contain shrink-0"
                                        />
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={cn('text-sm font-semibold', activo && (esShimmer || opcion.destacado) ? 'text-white' : 'text-slate-800')}>
                                            {opcion.label}
                                        </p>
                                        <p className={cn('text-xs', activo && (esShimmer || opcion.destacado) ? 'text-emerald-100' : 'text-slate-400')}>
                                            {formatPrecio(opcion.precioPorFrasco)} / frasco
                                        </p>
                                        {esShimmer && (
                                            <p key={personas.key} className={cn('text-[10px] font-medium mt-0.5 animate-fade-slide-up', activo ? 'text-emerald-100' : 'text-emerald-600')}>
                                                🔥 {personas.count} personas compraron esta promo hoy
                                            </p>
                                        )}
                                    </div>

                                    {/* Precio */}
                                    <div className="text-right shrink-0">
                                        <p className={cn('text-base font-bold', activo && (esShimmer || opcion.destacado) ? 'text-white' : 'text-slate-900')}>
                                            {formatPrecio(opcion.precio_bundle)}
                                        </p>
                                        {opcion.ahorroMonto != null && (
                                            <p className={cn('text-xs font-semibold', activo && (esShimmer || opcion.destacado) ? 'text-emerald-100' : 'text-emerald-600')}>
                                                Ahorras {formatPrecio(opcion.ahorroMonto)}{opcion.ahorrosPct ? ` · ${opcion.ahorrosPct}% off` : ''}
                                            </p>
                                        )}
                                        {opcion.precioTachado && (
                                            <p className={cn('text-xs line-through', activo && (esShimmer || opcion.destacado) ? 'text-emerald-200' : 'text-slate-400')}>
                                                {formatPrecio(opcion.precioTachado)}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
