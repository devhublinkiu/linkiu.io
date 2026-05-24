import { Button } from '@/Components/ui/Button'
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/Components/ui/Dialog'
import { AddressForm, type CamposForm, type ZonaDepto } from './AddressForm'

interface Props {
    open:     boolean
    onOpenChange: (open: boolean) => void
    titulo:   string
    form:     CamposForm
    setForm:  (f: CamposForm) => void
    errores:  Record<string, string>
    onGuardar: () => void
    guardando: boolean
    departamentosDisponibles: ZonaDepto[]
}

export function AddressModal({
    open, onOpenChange, titulo, form, setForm, errores, onGuardar, guardando, departamentosDisponibles,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{titulo}</DialogTitle>
                </DialogHeader>

                <AddressForm
                    form={form}
                    setForm={setForm}
                    errores={errores}
                    departamentosDisponibles={departamentosDisponibles}
                />

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={onGuardar} disabled={guardando}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
