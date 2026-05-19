import { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react'
import { ZapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const DURACION_HORAS = 10

function formatearTiempo(segundos: number) {
    const h = Math.floor(segundos / 3600)
    const m = Math.floor((segundos % 3600) / 60)
    const s = segundos % 60
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function ContenidoBar({ tiempoRestante, urgente }: { tiempoRestante: number; urgente: boolean }) {
    return (
        <>
            <ZapIcon className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="font-bold text-amber-400">10% OFF</span>
            <span className="text-white/50">·</span>
            <span className="font-bold text-white">ENVÍO GRATIS</span>
            <span className="text-white/50">·</span>
            <span className="font-bold text-white">TERMINA EN</span>
            <span className={cn(
                'inline-flex items-center justify-center text-xs font-bold px-2 py-0.5 rounded tabular-nums transition-colors duration-300',
                urgente ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-400 text-slate-900'
            )}>
                {formatearTiempo(tiempoRestante)}
            </span>
            <Link
                href="/productos"
                className="font-semibold text-amber-400 underline underline-offset-2 hover:text-amber-300 transition-colors duration-200 ease-in-out whitespace-nowrap"
            >
                Aprovechar ahora →
            </Link>
        </>
    )
}

export default function AnnouncementBar() {
    const [tiempoRestante, setTiempoRestante] = useState(DURACION_HORAS * 3600)
    const urgente = tiempoRestante < 3600

    useEffect(() => {
        const intervalo = setInterval(() => {
            setTiempoRestante(prev => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(intervalo)
    }, [])

    return (
        <div className="sticky top-0 z-50 bg-slate-900 overflow-hidden">

            {/* Desktop — estático y centrado */}
            <div className="hidden sm:flex items-center justify-center gap-2.5 px-4 py-2.5 text-sm">
                <ContenidoBar tiempoRestante={tiempoRestante} urgente={urgente} />
            </div>

            {/* Móvil — marquee continuo */}
            <div className="sm:hidden py-2.5">
                <div className="flex animate-marquee whitespace-nowrap text-sm">
                    <span className="inline-flex items-center gap-2.5 px-6">
                        <ContenidoBar tiempoRestante={tiempoRestante} urgente={urgente} />
                    </span>
                    {/* Duplicado para loop sin corte */}
                    <span className="inline-flex items-center gap-2.5 px-6" aria-hidden>
                        <ContenidoBar tiempoRestante={tiempoRestante} urgente={urgente} />
                    </span>
                </div>
            </div>

        </div>
    )
}
