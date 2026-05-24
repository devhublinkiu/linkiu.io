import { Switch } from '@/Components/ui/Switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/Tooltip'

interface Props {
    checked: boolean
    disabled?: boolean
    onCheckedChange: () => void
    puedeEditar: boolean
}

// Switch envuelto en tooltip que explica el bloqueo cuando el usuario no tiene
// permiso de edición. El span intermedio es necesario porque Switch es disabled
// y Radix omite el tooltip en elementos deshabilitados sin el wrapper.
export default function SwitchConPermiso({ checked, disabled, onCheckedChange, puedeEditar }: Props) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span>
                    <Switch
                        checked={checked}
                        disabled={disabled || !puedeEditar}
                        onCheckedChange={onCheckedChange}
                    />
                </span>
            </TooltipTrigger>
            {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
        </Tooltip>
    )
}
