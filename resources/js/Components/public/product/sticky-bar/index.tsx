import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
    ctaRef: React.RefObject<HTMLButtonElement | null>
    precio: number
}

function formatPrecio(n: number) {
    return '$' + n.toLocaleString('es-CO')
}

export default function StickyBar({ ctaRef, precio }: Props) {
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
                <button
                    onClick={() => ctaRef.current?.click()}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-base font-bold py-3.5 rounded-lg transition-all duration-200 ease-in-out animate-cta-pulse"
                >
                    🛒 Comprar ahora — {formatPrecio(precio)}
                </button>
            </div>
        </div>
    )
}
