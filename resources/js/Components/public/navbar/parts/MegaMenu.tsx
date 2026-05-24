import { Link, usePage } from '@inertiajs/react'
import { PackageOpen, ZapIcon } from 'lucide-react'
import { useFlashTimer } from '@/Components/public/products/ProductCard'

const COLORES = ['bg-amber-400', 'bg-emerald-500', 'bg-blue-400', 'bg-violet-400', 'bg-orange-400', 'bg-rose-400', 'bg-slate-400']
const FONDOS  = ['bg-amber-50', 'bg-slate-100', 'bg-emerald-50', 'bg-orange-50', 'bg-blue-50', 'bg-violet-50']

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

function formatPrecio(n: number) {
    return '$' + n.toLocaleString('es-CO')
}

function descuento(base: number, comparacion: number): number {
    return Math.round((1 - base / comparacion) * 100)
}

function Digito({ valor }: { valor: string }) {
    return (
        <div className="relative overflow-hidden h-3 w-2 flex items-center justify-center">
            <span key={valor} className="absolute font-black text-[9px] tabular-nums text-slate-950">
                {valor}
            </span>
        </div>
    )
}

function TimerBloque({ valor }: { valor: string }) {
    return (
        <div className="flex items-center bg-slate-50 rounded px-0.5 py-0.5">
            <Digito valor={valor[0]} />
            <Digito valor={valor[1]} />
        </div>
    )
}

export default function MegaMenu() {
    const { h, m, s } = useFlashTimer()
    const { nav_categorias, nav_productos } = usePage<{
        nav_categorias: { id: number; name: string; slug: string }[]
        nav_productos:  NavProducto[]
    }>().props

    return (
        <div className="bg-white border-b border-slate-200 shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex gap-10">

                    {/* Cards de productos */}
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Productos
                        </p>
                        <div className="grid grid-cols-4 gap-3">
                            {nav_productos.map((p, i) => {
                                const pct = p.precio_base && p.precio_comparacion
                                    ? descuento(p.precio_base, p.precio_comparacion)
                                    : null
                                return (
                                    <Link
                                        key={p.id}
                                        href={`/productos/${p.slug}`}
                                        className="group flex flex-col rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                                    >
                                        {/* Imagen */}
                                        <div className={`${FONDOS[i % FONDOS.length]} h-28 relative overflow-hidden`}>
                                            {p.badge && (
                                                <span className="absolute top-2 left-2 z-10 text-[9px] font-bold text-white bg-emerald-500 rounded-full px-1.5 py-0.5">
                                                    {p.badge}
                                                </span>
                                            )}
                                            {pct && (
                                                <span className="absolute top-2 right-2 z-10 text-[9px] font-bold text-white bg-amber-500 rounded-full px-1.5 py-0.5">
                                                    -{pct}%
                                                </span>
                                            )}
                                            {p.imagen ? (
                                                <img
                                                    src={p.imagen}
                                                    alt={p.nombre}
                                                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                                                />
                                            ) : (
                                                <div className="size-full flex items-center justify-center">
                                                    <PackageOpen className="size-10 text-slate-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Strip flash sale — solo si el hook está activo */}
                                        {p.oferta_relampago && (
                                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-between px-2 py-1">
                                                <div className="flex items-center gap-1">
                                                    <ZapIcon className="w-2.5 h-2.5 text-white fill-white shrink-0" />
                                                    <span className="text-[8px] font-black text-white uppercase tracking-wide leading-none">Flash</span>
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    <TimerBloque valor={h} />
                                                    <span className="text-white/80 font-black text-[9px] leading-none">:</span>
                                                    <TimerBloque valor={m} />
                                                    <span className="text-white/80 font-black text-[9px] leading-none">:</span>
                                                    <TimerBloque valor={s} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Info */}
                                        <div className="p-2.5 flex flex-col gap-1">
                                            <p className="text-xs font-bold text-slate-900 leading-tight">{p.nombre}</p>

                                            {/* Precio */}
                                            <div className="mt-0.5 flex items-baseline gap-1.5 flex-wrap">
                                                <span className="text-sm font-black text-slate-900">
                                                    {p.precio_base ? formatPrecio(p.precio_base) : '—'}
                                                </span>
                                                {p.precio_comparacion && (
                                                    <span className="text-[10px] text-slate-400 line-through">
                                                        {formatPrecio(p.precio_comparacion)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}

                            {nav_productos.length === 0 && (
                                <p className="col-span-4 text-sm text-slate-400 py-4">Sin productos disponibles.</p>
                            )}
                        </div>
                        <Link
                            href="/productos"
                            className="inline-block text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors duration-200 mt-3"
                        >
                            Ver todos los productos →
                        </Link>
                    </div>

                    {/* Divisor */}
                    <div className="w-px bg-slate-100 self-stretch shrink-0" />

                    {/* Categorías */}
                    <div className="w-44 shrink-0">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Categorías
                        </p>
                        <div className="flex flex-col gap-1">
                            {nav_categorias.map((cat, i) => (
                                <Link
                                    key={cat.id}
                                    href={`/productos/${cat.slug}`}
                                    className="group flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                                >
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${COLORES[i % COLORES.length]}`} />
                                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors duration-200 font-medium">
                                        {cat.name}
                                    </span>
                                </Link>
                            ))}
                            {nav_categorias.length === 0 && (
                                <p className="text-xs text-slate-400 px-2 py-2">Sin categorías aún</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
