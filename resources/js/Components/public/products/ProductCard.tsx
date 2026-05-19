import { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react'
import { StarIcon, ZapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Producto = {
    id: number
    nombre: string
    tono: string
    categoria: string
    grupo: string
    precio: number
    precioOriginal: number
    descuento: number
    estrellas: number
    resenas: number
    imagen: string
    fondo: string
    badge?: string | null
    flash?: boolean
    href: string
}

function formatPrecio(n: number) {
    return '$' + n.toLocaleString('es-CO')
}

function Digito({ valor }: { valor: string }) {
    return (
        <div className="relative overflow-hidden h-3.5 w-2 flex items-center justify-center">
            <span key={valor} className="absolute font-black text-[9px] tabular-nums text-white animate-digit-in">
                {valor}
            </span>
        </div>
    )
}

function TimerBloque({ valor }: { valor: string }) {
    return (
        <div className="flex items-center bg-black/25 rounded px-0.5 py-0.5">
            <Digito valor={valor[0]} />
            <Digito valor={valor[1]} />
        </div>
    )
}

const SEGUNDOS_FLASH = 5 * 3600 + 8 * 60 + 2

export function useFlashTimer() {
    const [seg, setSeg] = useState(SEGUNDOS_FLASH)
    useEffect(() => {
        const t = setInterval(() => setSeg(s => Math.max(0, s - 1)), 1000)
        return () => clearInterval(t)
    }, [])
    const h = String(Math.floor(seg / 3600)).padStart(2, '0')
    const m = String(Math.floor((seg % 3600) / 60)).padStart(2, '0')
    const s = String(seg % 60).padStart(2, '0')
    return { h, m, s }
}

interface Props {
    producto: Producto
    h: string
    m: string
    s: string
    size?: 'sm' | 'md'
}

export default function ProductCard({ producto, h, m, s, size = 'md' }: Props) {
    const imageH = size === 'sm' ? 'h-40' : 'h-52'
    const imgH   = size === 'sm' ? 'h-32' : 'h-44'

    return (
        <Link
            href={producto.href}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
        >
            {/* Imagen */}
            <div className={`relative ${producto.fondo} flex items-center justify-center ${imageH}`}>
                {producto.badge && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-emerald-500 rounded-full px-2 py-0.5">
                        {producto.badge}
                    </span>
                )}
                <span className="absolute top-3 right-3 text-[10px] font-bold text-white bg-amber-500 rounded-full px-2 py-0.5">
                    -{producto.descuento}%
                </span>
                <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className={cn('w-auto object-contain drop-shadow-md group-hover:-translate-y-1 transition-transform duration-300', imgH)}
                />
            </div>

            {/* Strip flash sale */}
            {producto.flash && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-between px-2.5 py-1">
                    <div className="flex items-center gap-1">
                        <ZapIcon className="w-2.5 h-2.5 text-white fill-white shrink-0" />
                        <span className="text-[9px] font-black text-white tracking-wide uppercase leading-none">
                            Oferta Relámpago
                        </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <TimerBloque valor={h} />
                        <span className="text-white font-black text-[9px] leading-none">:</span>
                        <TimerBloque valor={m} />
                        <span className="text-white font-black text-[9px] leading-none">:</span>
                        <TimerBloque valor={s} />
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{producto.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{producto.tono}</p>
                </div>

                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(i => (
                            <StarIcon key={i} className={cn('w-3 h-3', i <= Math.round(producto.estrellas) ? 'text-amber-400' : 'text-slate-200')} fill="currentColor" />
                        ))}
                    </div>
                    <span className="text-[10px] text-slate-400">({producto.resenas})</span>
                </div>

                <div className="mt-auto pt-1">
                    <p className="text-xs text-slate-400 line-through leading-none">{formatPrecio(producto.precioOriginal)}</p>
                    <p className="text-lg font-black text-slate-900">{formatPrecio(producto.precio)}</p>
                </div>

                <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200">
                    Comprar ahora
                </button>
            </div>
        </Link>
    )
}
