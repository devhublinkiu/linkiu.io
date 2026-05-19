import { CheckIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Fila { caracteristica: string; valores: (string | boolean)[] }

interface Props {
    config: Record<string, unknown>
}

function Celda({ valor, highlight }: { valor: string | boolean; highlight: boolean }) {
    if (typeof valor === 'boolean') {
        return valor
            ? <CheckIcon className={cn('w-5 h-5', highlight ? 'text-emerald-600' : 'text-emerald-500')} strokeWidth={2.5} />
            : <XIcon className="w-4 h-4 text-slate-300" strokeWidth={2} />
    }
    return (
        <span className={cn('text-xs font-semibold text-center leading-tight px-1', highlight ? 'text-emerald-700' : 'text-slate-400')}>
            {valor}
        </span>
    )
}

export default function TablaComparativa({ config }: Props) {
    const columnas = (config.columnas as string[] | undefined) ?? ['Nuestro producto', 'Competencia']
    const filas    = (config.filas    as Fila[]   | undefined) ?? []
    const titulo   = (config.titulo   as string   | undefined) ?? 'Comparativa'
    const subtitulo = (config.subtitulo as string | undefined) ?? ''

    if (filas.length === 0) return null

    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{titulo}</h2>
            {subtitulo && <p className="text-base text-slate-500 mb-6">{subtitulo}</p>}
            {!subtitulo && <div className="mb-6" />}

            <div className="rounded-xl overflow-hidden border border-slate-200">
                {/* Cabecera */}
                <div className="grid" style={{ gridTemplateColumns: `1fr repeat(${columnas.length}, min(140px, 22vw))` }}>
                    <div className="bg-slate-50 border-b border-slate-200 px-5 py-4" />
                    {columnas.map((col, ci) => (
                        <div key={ci} className={cn(
                            'border-b flex flex-col items-center justify-center py-4 px-3 gap-1',
                            ci === 0 ? 'bg-emerald-600 border-emerald-700' : 'bg-slate-50 border-l border-slate-200'
                        )}>
                            <span className={cn('text-xs sm:text-sm font-bold text-center', ci === 0 ? 'text-white' : 'text-slate-500')}>
                                {col}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Filas */}
                {filas.map((fila, i) => (
                    <div key={i} className={cn(
                        'grid border-b border-slate-100 last:border-0',
                        i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    )} style={{ gridTemplateColumns: `1fr repeat(${columnas.length}, min(140px, 22vw))` }}>
                        <div className="px-4 sm:px-5 py-3.5 flex items-center">
                            <span className="text-xs sm:text-sm font-medium text-slate-700">{fila.caracteristica}</span>
                        </div>
                        {fila.valores.map((v, vi) => (
                            <div key={vi} className={cn(
                                'flex items-center justify-center border-l px-2 sm:px-3',
                                vi === 0 ? 'bg-emerald-50 border-emerald-100' : 'border-slate-100'
                            )}>
                                <Celda valor={v} highlight={vi === 0} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    )
}
