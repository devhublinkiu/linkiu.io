import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/Components/ui/Sheet'
import FormContraentrega from './forms/FormContraentrega'
import FormTransferencia from './forms/FormTransferencia'
import type { MetodoPago } from './types'

interface Props {
    metodo:       MetodoPago | null
    puedeEditar:  boolean
    onClose:      () => void
}

/**
 * Sheet lateral que renderiza el form de configuración del método activo.
 * Cada método configurable inline (contraentrega, transferencia) tiene su
 * propio Form en ./forms/. Mercado Pago y Bold se configuran en Integraciones
 * — esos no abren este Sheet, usan `urlExterna` en MetodoCard.
 */
export default function SheetConfigMetodo({ metodo, puedeEditar, onClose }: Props) {
    return (
        <Sheet open={metodo !== null} onOpenChange={v => !v && onClose()}>
            <SheetContent className="sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle>{metodo?.nombre ?? ''}</SheetTitle>
                    <SheetDescription>{metodo?.descripcion ?? ''}</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {metodo?.clave === 'contraentrega' && (
                        <FormContraentrega metodo={metodo} puedeEditar={puedeEditar} onSaved={onClose} />
                    )}
                    {metodo?.clave === 'transferencia' && (
                        <FormTransferencia metodo={metodo} puedeEditar={puedeEditar} onSaved={onClose} />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
