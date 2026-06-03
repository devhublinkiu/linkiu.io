import { Trophy } from 'lucide-react'

interface Producto {
    producto_id:    number
    nombre:         string
    imagen:         string | null
    total_vendidas: number
    revenue:        number
}

interface Props {
    productos: Producto[]
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

/**
 * Top 5 productos por cantidad vendida hoy.
 */
export function TopProductos({ productos }: Props) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 h-full">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <Trophy className="size-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900">Top 5 productos hoy</h3>
            </div>

            {productos.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Sin ventas aún hoy</p>
            ) : (
                <div className="space-y-2.5">
                    {productos.map((p, i) => (
                        <div key={p.producto_id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50">
                            <span className="w-6 text-center text-xs font-bold text-slate-400">{i + 1}</span>
                            {p.imagen ? (
                                <img src={p.imagen} alt="" width={40} height={40} className="w-10 h-10 rounded-md object-cover bg-slate-100 shrink-0" />
                            ) : (
                                <div className="w-10 h-10 rounded-md bg-slate-100 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{p.nombre}</p>
                                <p className="text-xs text-slate-500">{p.total_vendidas} vendidas · {formatPrecio(p.revenue)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
