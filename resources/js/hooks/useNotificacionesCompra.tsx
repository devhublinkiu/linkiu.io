import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { ShoppingBagIcon, EyeIcon } from 'lucide-react'

interface FomoItem {
    tipo:     'compra' | 'vista'
    nombre?:  string
    ciudad?:  string
    producto: string
    hace:     string
}

function aleatorio(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function CompraToast({ item }: { item: FomoItem }) {
    return (
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-md w-80 max-w-full">
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <ShoppingBagIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                    {item.nombre} acaba de comprar
                </p>
                <p className="text-xs text-slate-500 truncate">
                    {item.producto}{item.ciudad ? ` · ${item.ciudad}` : ''}
                </p>
                <p className="text-xs text-slate-400">{item.hace}</p>
            </div>
        </div>
    )
}

function VistaToast({ item }: { item: FomoItem }) {
    return (
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-md w-80 max-w-full">
            <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <EyeIcon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">Alguien acaba de ver</p>
                <p className="text-xs text-slate-500 truncate">{item.producto}</p>
                <p className="text-xs text-slate-400">{item.hace}</p>
            </div>
        </div>
    )
}

export function useNotificacionesCompra() {
    const { build } = usePage<{ build?: { fomo_enabled?: boolean } }>().props

    useEffect(() => {
        if (!build?.fomo_enabled) return

        let items: FomoItem[] = []
        let indice = 0
        let timeoutId: ReturnType<typeof setTimeout>

        function mostrarSiguiente() {
            if (items.length === 0) return
            const item = items[indice % items.length]
            indice++

            toast.custom(() =>
                item.tipo === 'compra'
                    ? <CompraToast item={item} />
                    : <VistaToast item={item} />
            , { duration: 5000 })

            timeoutId = setTimeout(mostrarSiguiente, aleatorio(18000, 28000))
        }

        fetch('/api/fomo')
            .then(r => r.json())
            .then((data: FomoItem[]) => {
                if (!Array.isArray(data) || data.length === 0) return
                items = data
                indice = aleatorio(0, items.length - 1)
                timeoutId = setTimeout(mostrarSiguiente, 6000)
            })
            .catch(() => {})

        return () => clearTimeout(timeoutId)
    }, [build?.fomo_enabled])
}
