import { CreditCard, Zap, Settings, ExternalLink } from 'lucide-react'
import { Badge } from '@/Components/ui/Badge'
import { Button } from '@/Components/ui/Button'

interface Props {
    clave:        'mercadopago' | 'bold'
    nombre:       string
    descripcion:  string
    configurado:  boolean
    infoExtra?:   string
    onConfigurar: () => void
    puedeEditar:  boolean
    docsUrl?:     string
}

const ICONOS = {
    mercadopago: CreditCard,
    bold:        Zap,
}

/**
 * Card compacta para integraciones de pasarelas — uniforma el patrón
 * MercadoPago/Bold/futuras. Abre un Sheet lateral al hacer "Configurar".
 */
export default function PasarelaCard({ clave, nombre, descripcion, configurado, infoExtra, onConfigurar, puedeEditar, docsUrl }: Props) {
    const Icon = ICONOS[clave] ?? CreditCard

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 flex flex-col gap-4">

            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900">{nombre}</h3>
                        <Badge variant={configurado ? 'default' : 'secondary'}>
                            {configurado ? 'Configurado' : 'Sin configurar'}
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{descripcion}</p>
                    {infoExtra && (
                        <p className="text-[11px] text-slate-400 mt-1">{infoExtra}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {docsUrl ? (
                    <a
                        href={docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition-colors duration-200"
                    >
                        Documentación
                        <ExternalLink className="size-3" />
                    </a>
                ) : <span />}

                <Button variant="outline" size="sm" onClick={onConfigurar} disabled={!puedeEditar}>
                    <Settings className="size-3.5" />
                    Configurar
                </Button>
            </div>

        </div>
    )
}
