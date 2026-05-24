import { cn } from '@/lib/utils'
import { Label } from '@/Components/ui/Label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/Tooltip'

interface Opcion { label: string; value: string; hex: string }

interface Props {
    label:    string
    value:    string
    onChange: (v: string) => void
    opciones: Opcion[]
    disabled: boolean
    compact?: boolean
}

export default function TokenSelector({ label, value, onChange, opciones, disabled, compact }: Props) {
    if (compact) {
        const selected = opciones.find(o => o.value === value)
        return (
            <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-24 shrink-0">{label}</span>
                <div className="flex items-center gap-1.5">
                    {opciones.map(op => (
                        <Tooltip key={op.value}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => onChange(op.value)}
                                    className={cn(
                                        'w-5 h-5 rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
                                        value === op.value
                                            ? 'ring-2 ring-offset-1 ring-slate-800 scale-110'
                                            : 'opacity-60 hover:opacity-100 hover:scale-105',
                                    )}
                                    style={{
                                        backgroundColor: op.hex,
                                        border: op.hex === '#FFFFFF' ? '1px solid #cbd5e1' : undefined,
                                    }}
                                />
                            </TooltipTrigger>
                            <TooltipContent>{op.label}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
                {selected && (
                    <span className="text-xs text-slate-400 truncate">{selected.label}</span>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex flex-wrap gap-2">
                {opciones.map(op => (
                    <button
                        key={op.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(op.value)}
                        className={cn(
                            'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50',
                            value === op.value
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
                        )}
                    >
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: op.hex }} />
                        {op.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
