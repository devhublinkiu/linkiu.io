import { Label } from '@/Components/ui/Label'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/Components/ui/InputGroup'
import { cn } from '@/lib/utils'
import type { TipoCosto } from './types'

interface Props {
    tipoCosto: TipoCosto
    costo:     string
    umbral:    string
    onTipoCostoChange: (t: TipoCosto) => void
    onCostoChange:     (v: string) => void
    onUmbralChange:    (v: string) => void
}

// Formatea miles con punto (es-CO). Solo dígitos en el estado real para evitar
// problemas de cursor al re-formatear durante el typing.
function fmtInput(v: string): string {
    if (!v) return ''
    const n = parseInt(v, 10)
    return isNaN(n) ? '' : new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)
}

function stripFmt(v: string): string {
    return v.replace(/\./g, '').replace(/\D/g, '')
}

const OPCIONES = [
    { clave: 'gratis',       label: 'Gratis',       desc: 'Sin costo' },
    { clave: 'costo_fijo',   label: 'Costo fijo',   desc: 'Un precio único' },
    { clave: 'gratis_desde', label: 'Gratis desde', desc: 'Gratis a partir de' },
] as const

export default function TipoCostoSelector({
    tipoCosto, costo, umbral, onTipoCostoChange, onCostoChange, onUmbralChange,
}: Props) {
    return (
        <div className="space-y-2">
            <Label>Costo de envío</Label>

            <div className="grid grid-cols-3 gap-2">
                {OPCIONES.map(op => (
                    <button
                        key={op.clave}
                        onClick={() => onTipoCostoChange(op.clave)}
                        className={cn(
                            'flex flex-col items-start rounded-lg border p-3 text-left transition-colors duration-200 ease-in-out',
                            tipoCosto === op.clave
                                ? 'border-slate-900 bg-slate-50'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                        )}
                    >
                        <span className={cn('text-xs font-semibold', tipoCosto === op.clave ? 'text-slate-900' : 'text-slate-700')}>
                            {op.label}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">{op.desc}</span>
                    </button>
                ))}
            </div>

            {(tipoCosto === 'costo_fijo' || tipoCosto === 'gratis_desde') && (
                <div className={cn('grid gap-3', tipoCosto === 'gratis_desde' ? 'grid-cols-2' : 'grid-cols-1')}>
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500">
                            {tipoCosto === 'gratis_desde' ? 'Costo base' : 'Costo'}
                        </Label>
                        <InputGroup>
                            <InputGroupAddon>$</InputGroupAddon>
                            <InputGroupInput
                                type="text"
                                inputMode="numeric"
                                value={fmtInput(costo)}
                                onChange={e => onCostoChange(stripFmt(e.target.value))}
                                placeholder="9.900"
                                className="text-sm"
                            />
                        </InputGroup>
                    </div>
                    {tipoCosto === 'gratis_desde' && (
                        <div className="space-y-1">
                            <Label className="text-xs text-slate-500">Gratis a partir de</Label>
                            <InputGroup>
                                <InputGroupAddon>$</InputGroupAddon>
                                <InputGroupInput
                                    type="text"
                                    inputMode="numeric"
                                    value={fmtInput(umbral)}
                                    onChange={e => onUmbralChange(stripFmt(e.target.value))}
                                    placeholder="89.900"
                                    className="text-sm"
                                />
                            </InputGroup>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
