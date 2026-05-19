import { useEffect, useState } from 'react'
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Resena { nombre: string; ciudad: string; estrellas: number; comentario: string }

interface Props {
    config: Record<string, unknown>
}

function Estrellas({ valor, size = 'sm' }: { valor: number; size?: 'sm' | 'md' }) {
    const cls = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'
    return (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <StarIcon key={i} className={cn(cls, i <= valor ? 'text-amber-500' : 'text-slate-200')} fill="currentColor" />
            ))}
        </div>
    )
}

export default function ResenasClientes({ config }: Props) {
    const resenas = (config.resenas as Resena[] | undefined) ?? []
    const titulo  = (config.titulo  as string   | undefined) ?? 'Reseñas de clientes'
    const [activo, setActivo] = useState(0)

    useEffect(() => {
        if (resenas.length === 0) return
        const t = setInterval(() => setActivo(a => (a + 1) % resenas.length), 5000)
        return () => clearInterval(t)
    }, [resenas.length])

    if (resenas.length === 0) return null

    const total       = resenas.length
    const promedioRaw = resenas.reduce((s, r) => s + r.estrellas, 0) / total
    const promedio    = Math.round(promedioRaw * 10) / 10

    const distribucion = [5, 4, 3, 2, 1].map(e => ({
        estrellas:  e,
        porcentaje: Math.round((resenas.filter(r => r.estrellas === e).length / total) * 100),
    }))

    function ir(idx: number) { setActivo((idx + total) % total) }

    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">{titulo}</h2>

            {/* Resumen */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                <div className="text-center shrink-0">
                    <span className="text-5xl font-bold text-slate-900 leading-none">{promedio}</span>
                    <div className="flex justify-center mt-1.5">
                        <Estrellas valor={Math.round(promedioRaw)} size="md" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{total} reseñas</p>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                    {distribucion.map(({ estrellas, porcentaje }) => (
                        <div key={estrellas} className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 w-3 shrink-0">{estrellas}</span>
                            <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-7 text-right shrink-0">{porcentaje}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Slider */}
            <div className="overflow-hidden">
                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${activo * 100}%)` }}>
                    {resenas.map(({ nombre, ciudad, estrellas, comentario }, i) => {
                        const iniciales = nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                        return (
                            <div key={i} className="w-full shrink-0 bg-white rounded-xl border border-slate-100 p-6 flex flex-col gap-5" style={{ minWidth: '100%' }}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-500 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                                            <span className="text-white text-xs font-bold">{iniciales}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{nombre}</p>
                                            {ciudad && <p className="text-xs text-slate-500">{ciudad}</p>}
                                        </div>
                                    </div>
                                    <Estrellas valor={estrellas} />
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">"{comentario}"</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Navegación */}
            <div className="flex items-center justify-between mt-4">
                <button
                    onClick={() => ir(activo - 1)}
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors duration-200"
                >
                    <ChevronLeftIcon className="w-4 h-4 text-slate-500" />
                </button>
                <div className="flex gap-1.5">
                    {resenas.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => ir(i)}
                            className={cn('rounded-full transition-all duration-300', i === activo ? 'w-5 h-1.5 bg-slate-800' : 'w-1.5 h-1.5 bg-slate-200 hover:bg-slate-300')}
                        />
                    ))}
                </div>
                <button
                    onClick={() => ir(activo + 1)}
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors duration-200"
                >
                    <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                </button>
            </div>
        </section>
    )
}
