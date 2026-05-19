import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Bell, PackageIcon, X } from 'lucide-react'
import { getAblyClient } from '@/ably'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/Components/ui/DropdownMenu'

interface AdminNotification {
    uuid: string
    id: number
    codigo: string
    nombre: string
    total: number
    created_at: string
}

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

export default function NotificationsDropdown() {
    const [notificaciones, setNotificaciones] = useState<AdminNotification[]>([])
    const [sinLeer, setSinLeer] = useState(0)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const client = getAblyClient()
        const canal = client.channels.get('admin-orders')

        canal.subscribe('orden.nueva', (msg) => {
            const data = msg.data as Omit<AdminNotification, 'uuid'>
            const nueva: AdminNotification = { ...data, uuid: crypto.randomUUID() }
            setNotificaciones(prev => [nueva, ...prev.slice(0, 19)])
            setSinLeer(n => n + 1)
            toast.success(`Nuevo pedido ${data.codigo}`, {
                description: `${data.nombre} · ${formatPrecio(data.total)}`,
                action: {
                    label: 'Ver pedido',
                    onClick: () => router.visit(route('admin.ordenes.show', data.id)),
                },
            })
        })

        return () => { canal.unsubscribe('orden.nueva') }
    }, [])

    function abrirDropdown(v: boolean) {
        setOpen(v)
        if (v) setSinLeer(0)
    }

    function eliminar(uuid: string, e: React.MouseEvent) {
        e.stopPropagation()
        setNotificaciones(prev => prev.filter(n => n.uuid !== uuid))
    }

    return (
        <DropdownMenu open={open} onOpenChange={abrirDropdown}>
            <DropdownMenuTrigger asChild>
                <button className="relative rounded-lg p-2 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 outline-none">
                    <Bell className="size-5" />
                    {sinLeer > 0 && (
                        <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold leading-none text-white">
                            {sinLeer > 99 ? '99+' : sinLeer}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-0">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
                    {notificaciones.length > 0 && (
                        <button
                            onClick={() => setNotificaciones([])}
                            className="text-xs text-slate-400 hover:text-slate-600 transition-colors duration-200"
                        >
                            Limpiar todo
                        </button>
                    )}
                </div>

                {notificaciones.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <Bell className="mx-auto mb-2 size-8 text-slate-200" />
                        <p className="text-sm text-slate-400">Sin notificaciones</p>
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto">
                        {notificaciones.map(n => (
                            <div
                                key={n.uuid}
                                className="group flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors duration-150"
                            >
                                <div className="mt-0.5 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <PackageIcon className="w-3.5 h-3.5 text-slate-500" />
                                </div>

                                <button
                                    className="flex-1 min-w-0 text-left"
                                    onClick={() => { setOpen(false); router.visit(route('admin.ordenes.show', n.id)) }}
                                >
                                    <p className="text-xs font-semibold text-slate-900 font-mono">{n.codigo}</p>
                                    <p className="text-xs text-slate-500 truncate">{n.nombre}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{formatPrecio(n.total)} · {n.created_at}</p>
                                </button>

                                <button
                                    onClick={(e) => eliminar(n.uuid, e)}
                                    className="shrink-0 mt-0.5 p-0.5 rounded text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-200"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
