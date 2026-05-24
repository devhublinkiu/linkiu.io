import { useEffect, useState } from 'react'
import { usePage } from '@inertiajs/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PixelEvent } from '@/lib/usePixel'

interface SharedProps {
    fb_pixel_id:   string | null
    google_ads_id: string | null
    [key: string]: unknown
}

function timestamp(d: Date) {
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function PixelDebug() {
    const { fb_pixel_id, google_ads_id } = usePage<SharedProps>().props
    const [eventos, setEventos]     = useState<PixelEvent[]>([])
    const [minimizado, setMinimizado] = useState(false)

    const activo = typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).get('debug_pixel') === '1'

    useEffect(() => {
        if (!activo) return
        function onEvento(e: Event) {
            const detail = (e as CustomEvent<PixelEvent>).detail
            setEventos(prev => [detail, ...prev].slice(0, 20))
        }
        window.addEventListener('pixel:event', onEvento)
        return () => window.removeEventListener('pixel:event', onEvento)
    }, [activo])

    if (!activo) return null

    return (
        <div className="fixed bottom-4 right-4 z-[9999] w-80 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-wide">PIXEL DEBUG</span>
                </div>
                <button
                    type="button"
                    onClick={() => setMinimizado(m => !m)}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                    aria-label={minimizado ? 'Expandir' : 'Minimizar'}
                >
                    {minimizado ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {!minimizado && (
                <>
                    {/* Estado plataformas */}
                    <div className="px-4 py-3 border-b border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className={cn('w-2 h-2 rounded-full', fb_pixel_id ? 'bg-emerald-500' : 'bg-red-400')} />
                            <span className="text-xs font-medium text-slate-700">Meta Pixel</span>
                            {fb_pixel_id
                                ? <span className="text-xs text-emerald-600 font-mono ml-auto">{fb_pixel_id}</span>
                                : <span className="text-xs text-red-500 ml-auto">sin ID</span>
                            }
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={cn('w-2 h-2 rounded-full', google_ads_id ? 'bg-emerald-500' : 'bg-red-400')} />
                            <span className="text-xs font-medium text-slate-700">Google Ads</span>
                            {google_ads_id
                                ? <span className="text-xs text-emerald-600 font-mono ml-auto">{google_ads_id}</span>
                                : <span className="text-xs text-red-500 ml-auto">sin ID</span>
                            }
                        </div>
                    </div>

                    {/* Eventos */}
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                        {eventos.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-6">
                                Esperando eventos…
                            </p>
                        ) : (
                            eventos.map((ev, i) => (
                                <div key={i} className="px-4 py-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn(
                                                'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                                                ev.platform === 'fb'
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'bg-amber-50 text-amber-700',
                                            )}>
                                                {ev.platform === 'fb' ? 'Meta' : 'Google'}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-900">{ev.event}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono">{timestamp(new Date(ev.timestamp))}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                        {Object.entries(ev.data).map(([k, v]) => (
                                            <span key={k} className="text-[10px] text-slate-700">
                                                <span className="text-slate-500">{k}:</span> {String(v)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
