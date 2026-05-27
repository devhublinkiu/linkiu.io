import { useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Button } from '@/Components/ui/Button'
import { Textarea } from '@/Components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/Select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/Tooltip'
import SwitchConPermiso from '../SwitchConPermiso'
import type { MetodoPago } from '../types'

interface Props {
    metodo:      MetodoPago
    puedeEditar: boolean
    onSaved?:    () => void
}

/** Form de configuración para método "transferencia". Sin header. */
export default function FormTransferencia({ metodo, puedeEditar, onSaved }: Props) {
    const cfg = (metodo.config ?? {}) as Record<string, unknown>

    const [banco,         setBanco]         = useState<string>(String(cfg.banco         ?? ''))
    const [tipoCuenta,    setTipoCuenta]    = useState<string>(String(cfg.tipo_cuenta   ?? ''))
    const [numeroCuenta,  setNumeroCuenta]  = useState<string>(String(cfg.numero_cuenta ?? ''))
    const [titular,       setTitular]       = useState<string>(String(cfg.titular       ?? ''))
    const [tipoDoc,       setTipoDoc]       = useState<string>(String(cfg.tipo_doc      ?? ''))
    const [numeroDoc,     setNumeroDoc]     = useState<string>(String(cfg.numero_doc    ?? ''))
    const [instrucciones, setInstrucciones] = useState<string>(String(cfg.instrucciones ?? ''))
    const [comprobante,   setComprobante]   = useState<boolean>(cfg.comprobante_requerido !== false)
    const [guardando,     setGuardando]     = useState(false)

    function guardar() {
        setGuardando(true)
        router.post(route('admin.metodos-pago.config', metodo.id), {
            config: {
                banco:                 banco         || null,
                tipo_cuenta:           tipoCuenta    || null,
                numero_cuenta:         numeroCuenta  || null,
                titular:               titular       || null,
                tipo_doc:              tipoDoc       || null,
                numero_doc:            numeroDoc     || null,
                instrucciones:         instrucciones || null,
                comprobante_requerido: comprobante,
            },
        }, {
            preserveScroll: true,
            onSuccess: () => onSaved?.(),
            onError:   () => toast.error('Error al guardar'),
            onFinish:  () => setGuardando(false),
        })
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                    <Label>Banco</Label>
                    <Input value={banco} onChange={e => setBanco(e.target.value)} placeholder="Ej. Bancolombia" disabled={!puedeEditar} className="text-sm" />
                </div>
                <div className="space-y-1.5">
                    <Label>Tipo de cuenta</Label>
                    <Select value={tipoCuenta} onValueChange={setTipoCuenta} disabled={!puedeEditar}>
                        <SelectTrigger className="w-full text-sm"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ahorros">Ahorros</SelectItem>
                            <SelectItem value="corriente">Corriente</SelectItem>
                            <SelectItem value="bre-b">Bre-B</SelectItem>
                            <SelectItem value="billetera-virtual">Billetera virtual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                    <Label>Número de cuenta</Label>
                    <Input value={numeroCuenta} onChange={e => setNumeroCuenta(e.target.value)} placeholder="000-000000-00" disabled={!puedeEditar} className="text-sm" />
                </div>
                <div className="space-y-1.5">
                    <Label>Titular</Label>
                    <Input value={titular} onChange={e => setTitular(e.target.value)} placeholder="Nombre completo" disabled={!puedeEditar} className="text-sm" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                    <Label>Tipo de documento</Label>
                    <Select value={tipoDoc} onValueChange={setTipoDoc} disabled={!puedeEditar}>
                        <SelectTrigger className="w-full text-sm"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CC">Cédula de ciudadanía</SelectItem>
                            <SelectItem value="NIT">NIT</SelectItem>
                            <SelectItem value="CE">Cédula de extranjería</SelectItem>
                            <SelectItem value="PA">Pasaporte</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Número de documento</Label>
                    <Input value={numeroDoc} onChange={e => setNumeroDoc(e.target.value)} placeholder="123456789" disabled={!puedeEditar} className="text-sm" />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>Instrucciones <span className="text-slate-500 font-normal">(opcional)</span></Label>
                <Textarea value={instrucciones} onChange={e => setInstrucciones(e.target.value)} placeholder="Ej. Envía el comprobante al WhatsApp 300..." disabled={!puedeEditar} className="text-sm resize-none" rows={3} />
                <p className="text-xs text-slate-500">Texto visible al cliente al seleccionar este método.</p>
            </div>

            <div className="flex items-center justify-between gap-4 py-1 border-t border-slate-100">
                <div>
                    <p className="text-xs font-medium text-slate-700">Requerir comprobante</p>
                    <p className="text-xs text-slate-500 mt-0.5">El cliente debe subir el comprobante para confirmar.</p>
                </div>
                <SwitchConPermiso checked={comprobante} onCheckedChange={() => setComprobante(v => !v)} puedeEditar={puedeEditar} />
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
