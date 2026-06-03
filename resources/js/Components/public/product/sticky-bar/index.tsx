import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import BotonCompra, { type BotonCompraConfig } from '@/Components/public/product/boton-compra'

type Props = {
    ctaRef:             React.RefObject<HTMLButtonElement | null>
    triggerRef?:        React.RefObject<HTMLElement | null>  // elemento que decide visibilidad — si no viene, usa ctaRef
    precio:             number
    botonCompraConfig?: BotonCompraConfig | null
    botonCompraActivo?: boolean
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

export default function StickyBar({ ctaRef, triggerRef, precio, botonCompraConfig = null, botonCompraActivo = false }: Props) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Observamos triggerRef si viene (ej. el selector de cantidades), sino
        // caemos al ctaRef. La barra aparece cuando el trigger sale del viewport
        // hacia ARRIBA — es decir, el visitante ya paso ese punto scrolleando.
        const target = triggerRef?.current ?? ctaRef.current
        if (! target) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Solo mostrar cuando el trigger queda arriba del viewport (visitante avanzo).
                const fueraPorArriba = ! entry.isIntersecting && entry.boundingClientRect.top < 0
                setVisible(fueraPorArriba)
            },
            { threshold: 0 }
        )
        observer.observe(target)
        return () => observer.disconnect()
    }, [ctaRef, triggerRef])

    return (
        <div className={cn(
            'fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-3 transition-transform duration-300 ease-in-out',
            'md:left-1/2 md:border-l',
            visible ? 'translate-y-0' : 'translate-y-full'
        )}>
            <div className="md:pl-6">
                <BotonCompra
                    config={botonCompraConfig}
                    activo={botonCompraActivo}
                    precio={precio}
                    formatPrecio={formatPrecio}
                    onClick={() => ctaRef.current?.click()}
                    sticky
                />
            </div>
        </div>
    )
}
