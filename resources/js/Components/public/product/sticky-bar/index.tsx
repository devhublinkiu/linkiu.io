import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import BotonCompra, { type BotonCompraConfig } from '@/Components/public/product/boton-compra'

type Props = {
    ctaRef:             React.RefObject<HTMLButtonElement | null>
    precio:             number
    botonCompraConfig?: BotonCompraConfig | null
    botonCompraActivo?: boolean
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

export default function StickyBar({ ctaRef, precio, botonCompraConfig = null, botonCompraActivo = false }: Props) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (!ctaRef.current) return
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(!entry.isIntersecting),
            { threshold: 0 }
        )
        observer.observe(ctaRef.current)
        return () => observer.disconnect()
    }, [ctaRef])

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
