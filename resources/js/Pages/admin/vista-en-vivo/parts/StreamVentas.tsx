import { ShoppingBag, Zap, Package } from 'lucide-react'

export interface VentaItem {
    id:          number
    codigo:      string
    nombre:      string
    ciudad:      string | null
    total:       number
    metodo_pago: string | null
    cantidad:    number
    created_at:  string | null
}

const LABEL_METODO: Record<string, string> = {
    mercadopago:   'Mercado Pago',
    bold:          'Bold',
    contraentrega: 'Contraentrega',
    transferencia: 'Transferencia',
}

interface Props {
    ventas:     VentaItem[]
    idsNuevas?: Set<number>
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function tiempoRelativo(iso: string | null): string {
    if (! iso) return ''
    const ms = Date.now() - new Date(iso).getTime()
    const min = Math.floor(ms / 60_000)
    if (min < 1) return 'ahora'
    if (min < 60) return `${min}m`
    const hr = Math.floor(min / 60)
    return `${hr}h`
}

/**
 * Stream lateral de las últimas ventas del día — las nuevas (recibidas por
 * Ably) entran con animación slide-in.
 */
export function StreamVentas({ ventas, idsNuevas }: Props) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
                <Zap className="size-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-900">Ventas en vivo</h3>
            </div>

            {ventas.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-8">
                    <ShoppingBag className="size-8 mb-2" />
                    <p className="text-sm">Ninguna venta aún hoy</p>
                </div>
            ) : (
                <div className="space-y-3 flex-1 overflow-y-auto">
                    {ventas.map((v) => {
                        const esNueva = idsNuevas?.has(v.id) ?? false
                        return (
                        <div
                            key={v.id}
                            className={`flex items-start gap-3 p-2.5 rounded-md transition-all duration-500 ${
                                esNueva ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'hover:bg-slate-50'
                            }`}
                        >
                            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                <ShoppingBag className="size-4" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between gap-2">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{v.nombre}</p>
                                    <span className="text-xs text-slate-400 shrink-0">{tiempoRelativo(v.created_at)}</span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {v.ciudad ?? 'Sin ciudad'} · {v.codigo}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-sm font-semibold text-emerald-600">{formatPrecio(v.total)}</p>
                                    {v.cantidad > 0 && (
                                        <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
                                            <Package className="size-3" />
                                            {v.cantidad} {v.cantidad === 1 ? 'item' : 'items'}
                                        </span>
                                    )}
                                </div>
                                {v.metodo_pago && (
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {LABEL_METODO[v.metodo_pago] ?? v.metodo_pago}
                                    </p>
                                )}
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
    )
}
