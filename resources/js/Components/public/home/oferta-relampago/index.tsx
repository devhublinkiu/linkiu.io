import { useEffect, useRef, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { PackageOpen, StarIcon, ZapIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Timer ────────────────────────────────────────────────────────────────────

const SEGUNDOS_OFERTA = 5 * 3600 + 8 * 60 + 2

function useTimer(inicial: number) {
    const [seg, setSeg] = useState(inicial)
    useEffect(() => {
        const t = setInterval(() => setSeg(s => Math.max(0, s - 1)), 1000)
        return () => clearInterval(t)
    }, [])
    const h = String(Math.floor(seg / 3600)).padStart(2, '0')
    const m = String(Math.floor((seg % 3600) / 60)).padStart(2, '0')
    const s = String(seg % 60).padStart(2, '0')
    return { h, m, s }
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
        <div className="flex items-center bg-black/25 rounded px-0.5 py-0.5 gap-0">
            <Digito valor={valor[0]} />
            <Digito valor={valor[1]} />
        </div>
    )
}

// ─── Datos ────────────────────────────────────────────────────────────────────

interface NavProducto {
    id:                  number
    nombre:              string
    slug:                string
    precio_base:         number | null
    precio_comparacion:  number | null
    imagen:              string | null
    oferta_relampago:    boolean
    badge:               string | null
}

function seeded(seed: number, min = 0, max = 100): number {
    const x = Math.sin(seed * 9301 + 49297) * 233280
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
}

function formatPrecio(n: number) {
    return '$' + n.toLocaleString('es-CO')
}

function descuento(base: number, comparacion: number): number {
    return Math.round((1 - base / comparacion) * 100)
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ProductCard({ producto, h, m, s }: { producto: NavProducto; h: string; m: string; s: string }) {
    const estrellas = seeded(producto.id * 3, 40, 50) / 10
    const resenas   = seeded(producto.id * 7, 50, 400)
    const pct       = producto.precio_base && producto.precio_comparacion
        ? descuento(producto.precio_base, producto.precio_comparacion)
        : null

    return (
        <Link
            href={`/productos/${producto.slug}`}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shrink-0 w-56 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200"
        >
            {/* Imagen */}
            <div className="relative bg-slate-50 h-44 overflow-hidden">
                {producto.badge && (
                    <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-white bg-emerald-500 rounded-full px-2 py-0.5">
                        {producto.badge}
                    </span>
                )}
                {pct && (
                    <span className="absolute top-2 right-2 z-10 text-[10px] font-bold text-white bg-amber-500 rounded-full px-2 py-0.5">
                        -{pct}%
                    </span>
                )}
                {producto.imagen ? (
                    <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="size-full flex items-center justify-center">
                        <PackageOpen className="size-12 text-slate-300" />
                    </div>
                )}
            </div>

            {/* Strip Oferta Relámpago — solo si el hook está activo */}
            {producto.oferta_relampago && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-between px-2.5 py-1">
                    <div className="flex items-center gap-1">
                        <ZapIcon className="w-2.5 h-2.5 text-white fill-white shrink-0" />
                        <span className="text-[9px] font-black text-white tracking-wide uppercase leading-none">
                            Oferta Relámpago
                        </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <TimerBloque valor={h} />
                        <span className="text-white font-black text-[10px] leading-none">:</span>
                        <TimerBloque valor={m} />
                        <span className="text-white font-black text-[10px] leading-none">:</span>
                        <TimerBloque valor={s} />
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="p-3.5 flex flex-col gap-2 flex-1">
                <p className="text-xs font-bold text-slate-900 leading-tight">{producto.nombre}</p>

                {/* Estrellas */}
                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(i => (
                            <StarIcon key={i} className={cn('w-3 h-3', i <= Math.round(estrellas) ? 'text-amber-400' : 'text-slate-200')} fill="currentColor" />
                        ))}
                    </div>
                    <span className="text-[10px] text-slate-400">({resenas})</span>
                </div>

                {/* Precio */}
                <div className="mt-auto flex items-baseline gap-2 flex-wrap">
                    <p className="text-base font-black text-slate-900">
                        {producto.precio_base ? formatPrecio(producto.precio_base) : '—'}
                    </p>
                    {producto.precio_comparacion && (
                        <span className="text-xs text-slate-400 line-through">
                            {formatPrecio(producto.precio_comparacion)}
                        </span>
                    )}
                </div>

                <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold py-2.5 rounded-lg transition-all duration-200">
                    Comprar ahora
                </button>
            </div>
        </Link>
    )
}

// ─── Sección principal ────────────────────────────────────────────────────────

export default function OfertaRelampago() {
    const { h, m, s } = useTimer(SEGUNDOS_OFERTA)
    const trackRef = useRef<HTMLDivElement>(null)
    const { nav_productos } = usePage<{ nav_productos: NavProducto[] }>().props

    function scroll(dir: 'left' | 'right') {
        if (!trackRef.current) return
        trackRef.current.scrollBy({ left: dir === 'right' ? 224 : -224, behavior: 'smooth' })
    }

    if (nav_productos.length === 0) return null

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Productos</h2>
                    <span className="text-sm text-slate-400 font-medium">Desliza para ver más →</span>
                </div>

                {/* Slider */}
                <div className="relative">
                    <div
                        ref={trackRef}
                        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {nav_productos.map(p => (
                            <ProductCard key={p.id} producto={p} h={h} m={m} s={s} />
                        ))}
                    </div>

                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-4 top-[45%] -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center hover:bg-slate-50 transition-colors duration-200 hidden sm:flex"
                    >
                        <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-4 top-[45%] -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center hover:bg-slate-50 transition-colors duration-200 hidden sm:flex"
                    >
                        <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                    </button>
                </div>

            </div>
        </section>
    )
}
