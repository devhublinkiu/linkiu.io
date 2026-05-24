import { Link } from '@inertiajs/react'
import { CreditCard, AlertCircle } from 'lucide-react'
import { Badge } from '@/Components/ui/Badge'
import SwitchConPermiso from './SwitchConPermiso'
import type { MetodoPago } from './types'

interface Props {
    metodo:         MetodoPago
    mp_configurado: boolean
    mp_sandbox:     boolean
    puedeEditar:    boolean
    onToggle:       () => void
}

export default function CardMercadoPago({ metodo, mp_configurado, mp_sandbox, puedeEditar, onToggle }: Props) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <CreditCard className="size-4 text-slate-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h3 className="text-sm font-semibold text-slate-900">{metodo.nombre}</h3>
                            {mp_configurado && (
                                <Badge variant={mp_sandbox ? 'secondary' : 'default'}>
                                    {mp_sandbox ? 'Sandbox' : 'Producción'}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{metodo.descripcion}</p>
                    </div>
                </div>
                <SwitchConPermiso
                    checked={metodo.activo}
                    disabled={!mp_configurado}
                    onCheckedChange={onToggle}
                    puedeEditar={puedeEditar}
                />
            </div>

            {!mp_configurado && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500">
                        Configura las credenciales antes de activar este método.{' '}
                        <Link
                            href={route('admin.integraciones.pasarelas')}
                            className="font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2 transition-colors duration-200"
                        >
                            Ir a Integraciones → Pasarelas de pago
                        </Link>
                    </p>
                </div>
            )}

            {mp_configurado && mp_sandbox && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                        Estás en modo sandbox — los pagos son simulados y no reales.{' '}
                        <Link
                            href={route('admin.integraciones.pasarelas')}
                            className="font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2 transition-colors duration-200"
                        >
                            Cambiar a producción
                        </Link>
                    </p>
                </div>
            )}
        </div>
    )
}
