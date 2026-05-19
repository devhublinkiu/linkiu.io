import { useEffect, useState } from 'react'
import { ClockIcon, ZapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
    config: Record<string, unknown>
}

function useCountdown(segundosIniciales: number) {
    const [segundos, setSegundos] = useState(segundosIniciales)
    useEffect(() => {
        const t = setInterval(() => setSegundos(s => (s > 0 ? s - 1 : 0)), 1000)
        return () => clearInterval(t)
    }, [])
    const h = String(Math.floor(segundos / 3600)).padStart(2, '0')
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0')
    const s = String(segundos % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
}

function useStockAgotandose(stockInicial: number, stockTotal: number, duracionMs: number) {
    const [barPct, setBarPct] = useState(0)
    const [stockActual, setStockActual] = useState(stockInicial)

    useEffect(() => {
        const pctInicial = ((stockTotal - stockInicial) / stockTotal) * 100
        const FASE1_MS = 1000

        let depletionInterval: ReturnType<typeof setInterval>
        let depletionTimer: ReturnType<typeof setTimeout>

        const fase1Start = Date.now()
        const fase1 = setInterval(() => {
            const t = Math.min((Date.now() - fase1Start) / FASE1_MS, 1)
            setBarPct((1 - Math.pow(1 - t, 3)) * pctInicial)
            if (t >= 1) clearInterval(fase1)
        }, 16)

        depletionTimer = setTimeout(() => {
            const start = Date.now()
            depletionInterval = setInterval(() => {
                const t = Math.min((Date.now() - start) / duracionMs, 1)
                setBarPct(pctInicial + t * (100 - pctInicial))
                setStockActual(Math.max(0, Math.round(stockInicial * (1 - t))))
                if (t >= 1) clearInterval(depletionInterval)
            }, 500)
        }, FASE1_MS + 300)

        return () => {
            clearInterval(fase1)
            clearTimeout(depletionTimer)
            clearInterval(depletionInterval)
        }
    }, [])

    return { barPct, stockActual }
}

export default function UrgenciaStock({ config }: Props) {
    const stockTotal    = (config.stock_total    as number | undefined) ?? 50
    const stockRestante = (config.stock_restante as number | undefined) ?? 12
    const duracionSegs  = ((config.duracion_horas as number | undefined) ?? 8) * 3600

    const { barPct, stockActual } = useStockAgotandose(stockRestante, stockTotal, duracionSegs * 1000)
    const countdown = useCountdown(duracionSegs)

    return (
        <div className={cn(
            'flex flex-col gap-2 rounded-lg px-4 py-3 border transition-colors duration-1000',
            barPct >= 98 ? 'bg-red-50 border-red-300' : 'bg-white border-slate-200'
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <ZapIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-medium text-slate-700">Stock limitado de hoy</span>
                </div>
                <span className={cn(
                    'text-xs font-bold tabular-nums transition-colors duration-500',
                    stockActual <= 5 ? 'text-red-600' : 'text-red-500'
                )}>{stockActual} unidades</span>
            </div>

            <div className="relative w-full py-1">
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full animate-stock-bar"
                        style={{
                            width: `${barPct}%`,
                            backgroundImage: 'linear-gradient(to right, #059669, #d97706 62%, #dc2626)',
                            backgroundSize: barPct > 0 ? `${(100 / barPct) * 100}%` : '100%',
                            backgroundPosition: '0 0',
                        }}
                    />
                </div>
                {barPct > 2 && (
                    <span
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-2xl leading-none pointer-events-none select-none"
                        style={{ left: `${Math.min(barPct, 96)}%` }}
                    >
                        🔥
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1.5">
                <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">La oferta termina en</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                    {countdown}
                </span>
            </div>
        </div>
    )
}
