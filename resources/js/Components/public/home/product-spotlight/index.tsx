import { useEffect, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { ChevronLeftIcon, ChevronRightIcon, PackageOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const FONDOS = [
    'from-amber-50 to-orange-50',
    'from-slate-100 to-slate-50',
    'from-emerald-50 to-teal-50',
    'from-violet-50 to-purple-50',
    'from-blue-50 to-sky-50',
]

interface NavCantidad {
    cantidad:      number
    precio_bundle: number
    badge_texto:   string | null
    destacado:     boolean
}

interface NavProducto {
    id:                  number
    nombre:              string
    slug:                string
    precio_base:         number | null
    precio_comparacion:  number | null
    descripcion:         string | null
    imagen:              string | null
    badge:               string | null
    cantidades:          NavCantidad[]
}

function formatPrecio(n: number) {
    return '$' + n.toLocaleString('es-CO')
}

function descuento(base: number, comparacion: number): number {
    return Math.round((1 - base / comparacion) * 100)
}

export default function ProductSpotlight() {
    const { nav_productos } = usePage<{ nav_productos: NavProducto[] }>().props
    const [activo,   setActivo]   = useState(0)
    const [animando, setAnimando] = useState(false)
    const total = nav_productos.length

    function ir(idx: number) {
        if (animando || total === 0) return
        setAnimando(true)
        setTimeout(() => {
            setActivo((idx + total) % total)
            setAnimando(false)
        }, 200)
    }

    useEffect(() => {
        if (total === 0) return
        const t = setInterval(() => ir(activo + 1), 6000)
        return () => clearInterval(t)
    }, [activo, total])

    if (total === 0) return null

    const p    = nav_productos[activo]
    const href = `/productos/${p.slug}`
    const pct  = p.precio_base && p.precio_comparacion ? descuento(p.precio_base, p.precio_comparacion) : null

    return (
        <section className="bg-white py-16 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Conoce nuestra línea</h2>
                    <div className="hidden sm:flex items-center gap-1.5">
                        {nav_productos.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => ir(i)}
                                className={cn(
                                    'rounded-full transition-all duration-300',
                                    i === activo ? 'w-5 h-1.5 bg-slate-800' : 'w-1.5 h-1.5 bg-slate-200 hover:bg-slate-300'
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Slide */}
                <div className={cn(
                    'grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center transition-opacity duration-200',
                    animando ? 'opacity-0' : 'opacity-100'
                )}>

                    {/* Imagen */}
                    <div className={`relative bg-gradient-to-br ${FONDOS[activo % FONDOS.length]} rounded-2xl min-h-80 lg:min-h-[420px] overflow-hidden`}>
                        {p.badge && (
                            <span className="absolute top-4 left-4 z-10 text-xs font-bold text-white bg-emerald-500 rounded-full px-3 py-1">
                                {p.badge}
                            </span>
                        )}
                        {pct && (
                            <span className="absolute top-4 right-4 z-10 text-xs font-bold text-white bg-amber-500 rounded-full px-3 py-1">
                                -{pct}%
                            </span>
                        )}

                        <button
                            onClick={() => ir(activo - 1)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center hover:bg-white transition-colors duration-200 shadow-sm z-10"
                        >
                            <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                            onClick={() => ir(activo + 1)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center hover:bg-white transition-colors duration-200 shadow-sm z-10"
                        >
                            <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                        </button>

                        {p.imagen ? (
                            <img
                                key={p.id}
                                src={p.imagen}
                                alt={p.nombre}
                                className="absolute inset-0 size-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <PackageOpen className="size-24 text-slate-300" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-5">

                        {/* Nombre + descripción */}
                        <div>
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{p.nombre}</h3>
                            {p.descripcion && (
                                <p className="text-slate-500 mt-2 leading-relaxed">{p.descripcion}</p>
                            )}
                        </div>

                        {/* Ofertas de cantidad */}
                        {p.cantidades.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {p.cantidades.map((c, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            'flex items-center justify-between rounded-xl border px-4 py-3 transition-colors duration-200',
                                            c.destacado
                                                ? 'border-amber-300 bg-amber-50'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-800">
                                                {c.cantidad === 1 ? '1 unidad' : `${c.cantidad} unidades`}
                                            </span>
                                            {c.badge_texto && (
                                                <span className="text-[10px] font-bold text-white bg-emerald-500 rounded-full px-2 py-0.5">
                                                    {c.badge_texto}
                                                </span>
                                            )}
                                        </div>
                                        <span className={cn(
                                            'text-sm font-black',
                                            c.destacado ? 'text-amber-700' : 'text-slate-900'
                                        )}>
                                            {formatPrecio(c.precio_bundle)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Precio */}
                        <div className="flex items-baseline gap-3 pt-1">
                            <span className="text-4xl font-black text-slate-900">
                                {p.precio_base ? formatPrecio(p.precio_base) : '—'}
                            </span>
                            {p.precio_comparacion && (
                                <>
                                    <span className="text-base text-slate-400 line-through">
                                        {formatPrecio(p.precio_comparacion)}
                                    </span>
                                    {pct && (
                                        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                            {pct}% off
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        {/* CTAs */}
                        <div className="flex gap-3 flex-wrap">
                            <Link
                                href={href}
                                className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm"
                            >
                                Comprar ahora
                            </Link>
                            <Link
                                href={href}
                                className="inline-flex items-center border border-slate-200 text-slate-600 bg-white font-medium px-5 py-3.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 text-sm"
                            >
                                Ver detalles
                            </Link>
                        </div>

                        {/* Dots móvil */}
                        <div className="flex sm:hidden items-center gap-1.5 pt-1">
                            {nav_productos.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => ir(i)}
                                    className={cn(
                                        'rounded-full transition-all duration-300',
                                        i === activo ? 'w-5 h-1.5 bg-slate-800' : 'w-1.5 h-1.5 bg-slate-200'
                                    )}
                                />
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </section>
    )
}
