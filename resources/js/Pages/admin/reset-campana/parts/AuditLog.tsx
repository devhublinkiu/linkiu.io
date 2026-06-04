import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { AuditOrden, AuditFunelinks } from '../Index'

interface Props {
    ordenes:   AuditOrden[]
    funelinks: AuditFunelinks[]
}

type Tab = 'ordenes' | 'funelinks'

function formatPrecio(n: number) {
    return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function formatFecha(iso: string) {
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function AuditLog({ ordenes, funelinks }: Props) {
    const [tab, setTab] = useState<Tab>('funelinks')

    return (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Historial de operaciones</h2>
                <p className="text-xs text-slate-500 mt-0.5">Últimas 50 operaciones por tipo. Registro inmutable.</p>
            </div>

            <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-100">
                {[
                    { id: 'funelinks' as const, label: 'Reset Funelinks', count: funelinks.length },
                    { id: 'ordenes'   as const, label: 'Órdenes eliminadas', count: ordenes.length   },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={cn(
                            'px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors duration-200',
                            tab === t.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        {t.label} <span className="text-slate-400">({t.count})</span>
                    </button>
                ))}
            </div>

            {tab === 'funelinks' && (
                <div className="divide-y divide-slate-100">
                    {funelinks.length === 0 ? (
                        <p className="px-5 py-8 text-center text-xs text-slate-400">Sin operaciones registradas.</p>
                    ) : funelinks.map(l => {
                        const totales = [
                            l.borrado_sesiones ? `${l.conteo_sesiones} sesiones` : null,
                            l.borrado_visitas  ? `${l.conteo_visitas} visitas`   : null,
                            l.borrado_fomo     ? `${l.conteo_fomo} fomo`         : null,
                        ].filter(Boolean).join(' · ')
                        return (
                            <div key={l.id} className="px-5 py-3 text-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-slate-700 font-medium">
                                            {l.rango_desde} → {l.rango_hasta}
                                            {l.producto && <span className="text-slate-500"> · {l.producto}</span>}
                                        </p>
                                        <p className="text-slate-500 mt-0.5">{totales || 'Sin datos borrados'}</p>
                                        <p className="text-slate-400 mt-1 italic">"{l.motivo}"</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-slate-500">{formatFecha(l.ejecutado_at)}</p>
                                        <p className="text-slate-400 mt-0.5">{l.usuario ?? '—'}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {tab === 'ordenes' && (
                <div className="divide-y divide-slate-100">
                    {ordenes.length === 0 ? (
                        <p className="px-5 py-8 text-center text-xs text-slate-400">Sin operaciones registradas.</p>
                    ) : ordenes.map(l => (
                        <div key={l.id} className="px-5 py-3 text-xs">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-slate-700 font-medium">
                                        {l.codigos.length} órdenes · {formatPrecio(l.total_eliminado_cop)}
                                    </p>
                                    <p className="text-slate-500 mt-0.5 font-mono truncate">
                                        {l.codigos.slice(0, 5).join(', ')}{l.codigos.length > 5 ? `… +${l.codigos.length - 5}` : ''}
                                    </p>
                                    <p className="text-slate-400 mt-1 italic">"{l.motivo}"</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-slate-500">{formatFecha(l.eliminado_at)}</p>
                                    <p className="text-slate-400 mt-0.5">{l.usuario ?? '—'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
