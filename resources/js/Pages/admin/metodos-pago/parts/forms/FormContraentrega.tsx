import { useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Label } from '@/Components/ui/Label'
import { Button } from '@/Components/ui/Button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/Components/ui/InputGroup'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/Tooltip'
import type { MetodoPago } from '../types'

interface Props {
    metodo:      MetodoPago
    puedeEditar: boolean
    onSaved?:    () => void
}

/**
 * Form de configuración para método "contraentrega". Recibe el método y
 * persiste el `recargo` en su `config`. Sin header — vive dentro de un Sheet.
 */
export default function FormContraentrega({ metodo, puedeEditar, onSaved }: Props) {
    const [recargo, setRecargo] = useState<string>(
        metodo.config?.recargo != null ? String(metodo.config.recargo) : ''
    )
    const [guardando, setGuardando] = useState(false)

    function guardar() {
        setGuardando(true)
        router.post(route('admin.metodos-pago.config', metodo.id), {
            config: { recargo: recargo !== '' ? parseInt(recargo) : null },
        }, {
            preserveScroll: true,
            onSuccess: () => onSaved?.(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="recargo">Recargo <span className="text-slate-500 font-normal">(opcional)</span></Label>
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
                <p className="text-xs text-emerald-600 font-medium">
                    💡 Tip: agrega un valor al recargo. Te ayudará a impulsar ventas con pago adelantado.
                </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span>
                            <Button size="sm" onClick={guardar} disabled={guardando || !puedeEditar}>
                                {guardando ? 'Guardando…' : 'Guardar'}
                            </Button>
                        </span>
                    </TooltipTrigger>
                    {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                </Tooltip>
            </div>
        </div>
    )
}
