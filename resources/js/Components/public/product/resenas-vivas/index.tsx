import { useEffect, useState } from 'react'
import { StarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
    config:        Record<string, unknown>
    resenasConfig: Record<string, unknown> | null
}

// Contador escalable de reseñas: incrementos variativos (+1 a +4) cada 10-18s
// para simular flujo real (50, 54, 62, 66, 70...). El badge "+N nueva(s)" se
// mantiene 2.5s para que el visitante alcance a leerlo.
function useResenasVivas(inicial: number) {
    const [count, setCount]   = useState(inicial)
    const [bump, setBump]     = useState(false)
    const [ultimo, setUltimo] = useState(1)

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>
        function programarSiguiente() {
            timeout = setTimeout(() => {
                const inc = Math.floor(Math.random() * 4) + 1  // 1-4
                setUltimo(inc)
                setCount(c => c + inc)
                setBump(true)
                setTimeout(() => setBump(false), 2500)
                programarSiguiente()
            }, Math.random() * 8000 + 10000)
        }
        programarSiguiente()
        return () => clearTimeout(timeout)
    }, [])

    return { count, bump, ultimo }
}

export default function ResenasVivas({ resenasConfig }: Props) {
    const resenasArr     = (resenasConfig?.resenas as Array<{ estrellas: number }> | undefined) ?? []
    const inicial        = resenasArr.length > 0 ? resenasArr.length : 312
    const ratingPromedio = resenasArr.length > 0
        ? Math.round((resenasArr.reduce((s, r) => s + r.estrellas, 0) / resenasArr.length) * 10) / 10
        : 4.7

    const { count, bump, ultimo } = useResenasVivas(inicial)

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => (
                    <StarIcon key={i} className={cn('w-4 h-4', i <= Math.round(ratingPromedio) ? 'text-amber-400' : 'text-slate-200')} fill="currentColor" />
                ))}
            </div>
            <span className="text-sm font-bold text-slate-900">{ratingPromedio.toFixed(1)}</span>
            <span className="text-slate-200 select-none">·</span>
            <span className="text-sm text-slate-500">
                <span className={cn('font-semibold text-slate-900 tabular-nums', bump && 'animate-cart-bump inline-block')}>
                    {count}
                </span>
                {' '}reseñas
            </span>
            {bump && (
                <span className="text-[11px] font-semibold text-emerald-600 animate-fade-slide-up leading-none">
                    +{ultimo} {ultimo === 1 ? 'nueva' : 'nuevas'}
                </span>
            )}
        </div>
    )
}
