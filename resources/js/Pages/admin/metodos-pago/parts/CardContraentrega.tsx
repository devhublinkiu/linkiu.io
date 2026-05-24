import { useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Truck } from 'lucide-react'
import { Label } from '@/Components/ui/Label'
import { Button } from '@/Components/ui/Button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/Components/ui/InputGroup'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/Tooltip'
import SwitchConPermiso from './SwitchConPermiso'
import type { MetodoPago } from './types'

interface Props {
    metodo:      MetodoPago
    puedeEditar: boolean
    onToggle:    () => void
}

export default function CardContraentrega({ metodo, puedeEditar, onToggle }: Props) {
    const [recargo, setRecargo] = useState<string>(
        metodo.config?.recargo != null ? String(metodo.config.recargo) : ''
    )
    const [guardando, setGuardando] = useState(false)

    function guardarConfig() {
        setGuardando(true)
        // toast.success viene del flash unificado del backend ('Configuración guardada.')
        router.post(route('admin.metodos-pago.config', metodo.id), {
            config: { recargo: recargo !== '' ? parseInt(recargo) : null },
        }, {
            preserveScroll: true,
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <Truck className="size-4 text-slate-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">{metodo.nombre}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{metodo.descripcion}</p>
                    </div>
                </div>
                <SwitchConPermiso
                    checked={metodo.activo}
                    onCheckedChange={onToggle}
                    puedeEditar={puedeEditar}
                />
            </div>

            <div className="pt-1 border-t border-slate-100 space-y-3">
                <div className="space-y-1.5">
                    <Label htmlFor="recargo">
                        Recargo <span className="text-slate-500 font-normal">(opcional)</span>
                    </Label>
                    <InputGroup>
                        <InputGroupAddon>$</InputGroupAddon>
                        <InputGroupInput
                            id="recargo"
                            type="text"
                            inputMode="numeric"
                            value={recargo}
                            onChange={e => setRecargo(e.target.value.replace(/\D/g, ''))}
                            placeholder="0"
                            disabled={!puedeEditar}
                            className="text-sm"
                        />
                    </InputGroup>
                    <p className="text-xs text-slate-500">
                        Costo adicional visible al cliente al seleccionar contraentrega. Déjalo en 0 si no aplica.
                    </p>
                </div>
                <div className="flex justify-end">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button size="sm" onClick={guardarConfig} disabled={guardando || !puedeEditar}>
                                    {guardando ? 'Guardando…' : 'Guardar'}
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                    </Tooltip>
                </div>
            </div>
        </div>
    )
}
