import { useEffect, useRef, useState } from 'react'
import { Link } from '@inertiajs/react'
import { ChevronDownIcon, ShoppingCartIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCart, type CartItem } from '@/contexts/CartContext'
import { trackFb, trackFbCustom } from '@/lib/usePixel'

type Props = {
    open:      boolean
    onClose:   () => void
    anchorRef: React.RefObject<HTMLButtonElement | null>
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function ItemRow({ item, onRemove }: { item: CartItem; onRemove: () => void }) {
    return (
        <div className="flex items-center gap-3 py-3 group">
            {item.imagen && (
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 shrink-0 overflow-hidden">
                    <img src={item.imagen} alt="" className="w-full h-full object-cover" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{item.nombre}</p>
                <p className="text-xs text-slate-400 truncate">{item.label}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <p className="text-sm font-bold text-slate-900">{formatPrecio(item.precio)}</p>
                <button
                    onClick={onRemove}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-300 hover:text-red-500 transition-all duration-200 ease-in-out"
                    aria-label="Eliminar"
                >
                    <Trash2Icon className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

export default function CartDropdown({ open, onClose, anchorRef }: Props) {
    const { items, removeItem, clearCart, total } = useCart()
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [expandido, setExpandido] = useState(false)

    const visibles   = expandido ? items : items.slice(0, 2)
    const restantes  = items.length - 2

    useEffect(() => {
        if (!open) return
        trackFbCustom('ViewCart', {
            content_ids: items.map(i => i.id),
            value:       total,
            currency:    'COP',
        })
    }, [open])

    useEffect(() => {
        if (!open) setExpandido(false)
    }, [open])

    useEffect(() => {
        if (!open) return
        function handleClick(e: MouseEvent) {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(e.target as Node)
            ) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open, onClose, anchorRef])

    function vaciarCarrito() {
        toast.custom(t => (
            <div className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 w-80">
                <p className="text-sm font-medium text-slate-700">¿Vaciar el carrito?</p>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => toast.dismiss(t)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors duration-200 ease-in-out"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => { clearCart(); toast.dismiss(t) }}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors duration-200 ease-in-out"
                    >
                        Vaciar
                    </button>
                </div>
            </div>
        ), { id: 'vaciar-carrito' })
    }

    if (!open) return null

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <p className="text-sm font-semibold text-slate-900">Tu carrito</p>
                {items.length > 0 && (
                    <div className="flex items-center gap-3">
                        <p className="text-xs text-slate-400">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
                        <button
                            onClick={vaciarCarrito}
                            className="text-xs text-slate-400 hover:text-red-500 transition-colors duration-200 ease-in-out"
                        >
                            Vaciar
                        </button>
                    </div>
                )}
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 px-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <ShoppingCartIcon className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400">Tu carrito está vacío</p>
                </div>
            ) : (
                <>
                    <div className={cn('px-4 divide-y divide-slate-100 overflow-y-auto', expandido && 'max-h-64')}>
                        {visibles.map(item => (
                            <ItemRow key={item.id} item={item} onRemove={() => removeItem(item.id)} />
                        ))}
                    </div>

                    {restantes > 0 && (
                        <button
                            onClick={() => setExpandido(v => !v)}
                            className="flex items-center justify-center gap-1 w-full py-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors duration-200 ease-in-out"
                        >
                            {expandido
                                ? 'Ver menos'
                                : `+${restantes} producto${restantes > 1 ? 's' : ''} más`
                            }
                            <ChevronDownIcon className={cn('w-3 h-3 transition-transform duration-200', expandido && 'rotate-180')} />
                        </button>
                    )}

                    <div className="border-t border-slate-100 px-4 py-3 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">Total</p>
                            <p className="text-base font-bold text-slate-900">{formatPrecio(total)}</p>
                        </div>
                        <Link
                            href="/checkout"
                            onClick={onClose}
                            className="w-full block text-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold py-3 rounded-lg transition-all duration-200 ease-in-out"
                        >
                            Finalizar compra
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}
