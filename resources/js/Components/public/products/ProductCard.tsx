import { useEffect, useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { PackageOpen, ZapIcon } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export interface ProductoPublico {
    id:                 number
    nombre:             string
    slug:               string
    precio_base:        number
    precio_comparacion: number | null
    imagen_principal:   string | null
    categoria_slug:     string | null
    oferta_relampago:   boolean
    badge:              string | null
    requiere_seleccion: boolean
}

const FONDOS = ['bg-amber-50', 'bg-slate-100', 'bg-emerald-50', 'bg-orange-50', 'bg-blue-50']

function formatPrecio(n: number) {
    return '$' + n.toLocaleString('es-CO')
}

function descuentoPct(base: number, comparacion: number): number {
    return Math.round((1 - base / comparacion) * 100)
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

// Timer decorativo para el strip "Oferta Relámpago" del card. El hook
// oferta_relampago es de tipo `simple` (sin config), por eso no hay un
// fin_timer real por producto. Cuando el contador llega a 0 reinicia
// para evitar quedar congelado en 00:00:00.
const SEGUNDOS_FLASH = 5 * 3600 + 8 * 60 + 2

export function useFlashTimer() {
    const [seg, setSeg] = useState(SEGUNDOS_FLASH)
    useEffect(() => {
        const t = setInterval(() => setSeg(s => s <= 1 ? SEGUNDOS_FLASH : s - 1), 1000)
        return () => clearInterval(t)
    }, [])
    const h = String(Math.floor(seg / 3600)).padStart(2, '0')
    const m = String(Math.floor((seg % 3600) / 60)).padStart(2, '0')
    const s = String(seg % 60).padStart(2, '0')
    return { h, m, s }
}

interface Props {
    producto: ProductoPublico
    h?: string
    m?: string
    s?: string
    size?: 'sm' | 'md'
}

export default function ProductCard({ producto, h = '00', m = '00', s = '00', size = 'md' }: Props) {
    const { addItem } = useCart()
    const fondo = FONDOS[producto.id % FONDOS.length]
    const pct   = producto.precio_base && producto.precio_comparacion
        ? descuentoPct(producto.precio_base, producto.precio_comparacion)
        : null

    const imageH = size === 'sm' ? 'h-40' : 'h-52'

    function comprarAhora(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        // Si requiere seleccionar variante o cantidad, mejor que el cliente elija en la página de detalle.
        if (producto.requiere_seleccion) {
            router.visit(`/productos/${producto.slug}`)
            return
        }

        addItem({
            productoId: producto.id,
            nombre:     producto.nombre,
            imagen:     producto.imagen_principal ?? '',
            label:      '1 unidad',
            cantidad:   1,
            precio:     producto.precio_base,
        })
        router.visit('/checkout')
    }

    return (
        <Link
            href={`/productos/${producto.slug}`}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
        >
            {/* Imagen */}
            <div className={`${fondo} ${imageH} relative overflow-hidden`}>
                {producto.badge && (
                    <span className="absolute top-3 left-3 z-10 text-[10px] font-bold text-white bg-emerald-500 rounded-full px-2 py-0.5">
                        {producto.badge}
                    </span>
                )}
                {pct !== null && (
                    <span className="absolute top-3 right-3 z-10 text-[10px] font-bold text-white bg-amber-500 rounded-full px-2 py-0.5">
                        -{pct}%
                    </span>
                )}
                {producto.imagen_principal ? (
                    <img
                        src={producto.imagen_principal}
                        alt={producto.nombre}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                    />
                ) : (
                    <div className="size-full flex items-center justify-center">
                        <PackageOpen className="size-12 text-slate-300" />
                    </div>
                )}
            </div>

            {/* Strip flash sale */}
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
                        <span className="text-white font-black text-[9px] leading-none">:</span>
                        <TimerBloque valor={m} />
                        <span className="text-white font-black text-[9px] leading-none">:</span>
                        <TimerBloque valor={s} />
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                <p className="text-sm font-bold text-slate-900 leading-tight">{producto.nombre}</p>

                <div className="mt-auto pt-1">
                    {pct !== null && (
                        <p className="text-xs text-slate-400 line-through leading-none">
                            {formatPrecio(producto.precio_comparacion!)}
                        </p>
                    )}
                    <p className="text-lg font-black text-slate-900">{formatPrecio(producto.precio_base)}</p>
                </div>

                <button
                    type="button"
                    onClick={comprarAhora}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200"
                >
                    Comprar ahora
                </button>
            </div>
        </Link>
    )
}
