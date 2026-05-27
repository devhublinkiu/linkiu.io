import { Link } from '@inertiajs/react'
import { CreditCard, Zap, Banknote, Landmark, Settings, ExternalLink, AlertCircle } from 'lucide-react'
import { Badge } from '@/Components/ui/Badge'
import { Button } from '@/Components/ui/Button'
import SwitchConPermiso from './SwitchConPermiso'
import type { MetodoPago } from './types'

interface Props {
    metodo:          MetodoPago
    configurado:     boolean
    infoExtra?:      string
    puedeEditar:     boolean
    onToggle:        () => void
    onConfigurar?:   () => void
    urlExterna?:     string
}

// Iconos por método — fácilmente extensible si sumamos pasarelas.
const ICONOS = {
    mercadopago:   CreditCard,
    bold:          Zap,
    contraentrega: Banknote,
    transferencia: Landmark,
} as Record<string, typeof CreditCard>

/**
 * Card uniforme para cualquier método. Permite dos flujos de configuración:
 *  - `onConfigurar`: abre Sheet con form interno (contraentrega, transferencia)
 *  - `urlExterna`:   link a otra página (Integraciones → Pasarelas para MP/Bold)
 */
export default function MetodoCard({ metodo, configurado, infoExtra, puedeEditar, onToggle, onConfigurar, urlExterna }: Props) {
    const Icon = ICONOS[metodo.clave] ?? CreditCard

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 flex flex-col gap-4">

            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-slate-900">{metodo.nombre}</h3>
                            <Badge variant={configurado ? 'default' : 'secondary'}>
                                {configurado ? 'Configurado' : 'Sin configurar'}
                            </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{metodo.descripcion}</p>
                        {infoExtra && (
                            <p className="text-[11px] text-slate-400 mt-1">{infoExtra}</p>
                        )}
                    </div>
                </div>
                <SwitchConPermiso
                    checked={metodo.activo}
                    disabled={!configurado}
                    onCheckedChange={onToggle}
                    puedeEditar={puedeEditar}
                />
            </div>

            {!configurado && urlExterna && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-200">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500">Configura las credenciales para activar este método.</p>
                </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                {urlExterna ? (
                    <Link href={urlExterna}>
                        <Button variant="outline" size="sm">
                            <Settings className="size-3.5" />
                            Configurar en Integraciones
                            <ExternalLink className="size-3" />
                        </Button>
                    </Link>
                ) : onConfigurar ? (
                    <Button variant="outline" size="sm" onClick={onConfigurar} disabled={!puedeEditar}>
                        <Settings className="size-3.5" />
                        Configurar
                    </Button>
                ) : null}
            </div>

        </div>
    )
}
