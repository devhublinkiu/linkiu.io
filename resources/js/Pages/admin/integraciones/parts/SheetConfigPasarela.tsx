import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/Components/ui/Sheet'
import { Button } from '@/Components/ui/Button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/Tooltip'
import { MercadoPagoCard, type MercadoPagoFormState } from './MercadoPagoCard'
import { BoldCard, type BoldFormState } from './BoldCard'

type Clave = 'mercadopago' | 'bold' | null

interface Props {
    clave:       Clave
    form:        MercadoPagoFormState & BoldFormState
    setForm:     (v: any) => void
    puedeEditar: boolean
    guardando:   boolean
    onGuardar:   () => void
    onClose:     () => void
    mpWebhookUrl:        string
    boldWebhookUrl:      string
    identityKeyPresente: boolean
    secretKeyPresente:   boolean
}

const TITULOS: Record<Exclude<Clave, null>, { titulo: string; descripcion: string }> = {
    mercadopago: { titulo: 'Mercado Pago',  descripcion: 'Tarjetas, PSE, Nequi y más con la pasarela más usada en Colombia.' },
    bold:        { titulo: 'Bold',          descripcion: 'Tarjetas, PSE, Nequi, Bancolombia y QR. Comisión desde 1.50%.' },
}

/**
 * Sheet lateral con el form de configuración de la pasarela activa.
 * Usa MercadoPagoCard / BoldCard con `embedded={true}` para evitar headers
 * duplicados (el Sheet ya provee su propio header).
 */
export default function SheetConfigPasarela({ clave, form, setForm, puedeEditar, guardando, onGuardar, onClose, mpWebhookUrl, boldWebhookUrl, identityKeyPresente, secretKeyPresente }: Props) {
    const meta = clave ? TITULOS[clave] : null

    return (
        <Sheet open={clave !== null} onOpenChange={v => !v && onClose()}>
            <SheetContent className="sm:max-w-3xl flex flex-col">
                <SheetHeader>
                    <SheetTitle>{meta?.titulo ?? ''}</SheetTitle>
                    <SheetDescription>{meta?.descripcion ?? ''}</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {clave === 'mercadopago' && (
                        <MercadoPagoCard form={form} setForm={setForm} puedeEditar={puedeEditar} webhookUrl={mpWebhookUrl} embedded />
                    )}
                    {clave === 'bold' && (
                        <BoldCard form={form} setForm={setForm} puedeEditar={puedeEditar} webhookUrl={boldWebhookUrl} identityKeyPresente={identityKeyPresente} secretKeyPresente={secretKeyPresente} embedded />
                    )}
                </div>

                <SheetFooter>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button onClick={onGuardar} disabled={guardando || !puedeEditar}>
                                    {guardando ? 'Guardando…' : 'Guardar cambios'}
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {!puedeEditar && <TooltipContent>No tienes permiso para editar</TooltipContent>}
                    </Tooltip>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
