import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ICONOS_SENAL } from './senales'
import type { Senal } from './types'

interface Props {
    senal: Senal | null
}

/**
 * Icono cualitativo de la señal del producto. Hover muestra label +
 * acción sugerida (descripción del enum backend).
 */
export function SenalIcon({ senal }: Props) {
    const [rect, setRect] = useState<DOMRect | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    function handleEnter() {
        if (ref.current) setRect(ref.current.getBoundingClientRect())
    }

    if (!senal) {
        return (
            <span className="inline-block w-6 text-center text-slate-300 select-none">—</span>
        )
    }

    const { icon: Icon, color } = ICONOS_SENAL[senal.key]

    return (
        <div
            ref={ref}
            className="cursor-default inline-flex items-center justify-center w-6"
            onMouseEnter={handleEnter}
            onMouseLeave={() => setRect(null)}
        >
            <Icon className={`size-4 ${color}`} aria-label={senal.label} />

            {rect && createPortal(
                <div
                    className="fixed z-[9999] w-56 rounded-lg border border-slate-200 bg-white p-3 text-xs pointer-events-none shadow-sm"
                    style={{ top: rect.top - 8, left: rect.left, transform: 'translateY(-100%) translateX(-50%)' }}
                >
                    <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Icon className={`size-3.5 ${color}`} />
                        {senal.label}
                    </p>
                    <p className="text-slate-500 leading-relaxed">{senal.descripcion}</p>
                </div>,
                document.body,
            )}
        </div>
    )
}
