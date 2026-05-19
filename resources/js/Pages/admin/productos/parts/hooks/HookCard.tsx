import { Settings2 } from 'lucide-react'
import { Button } from '@/Components/ui/Button'
import { Switch } from '@/Components/ui/Switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/Tooltip'
import type { HookCatalogItem } from '../../edit'

interface Props {
    item:        HookCatalogItem
    activo:      boolean
    toggling:    boolean
    onToggle:    () => void
    onConfigure?: () => void
}

export default function HookCard({ item, activo, toggling, onToggle, onConfigure }: Props) {
    return (
        <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{item.label}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.tipo === 'simple'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-violet-50 text-violet-700'
                    }`}>
                        {item.tipo === 'simple' ? 'Simple' : 'Configurable'}
                    </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.descripcion}</p>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
                {item.tipo === 'configurable' && onConfigure && (
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="outline" size="sm" onClick={onConfigure}>
                                    <Settings2 className="size-3.5" />
                                    Configurar
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Configurar opciones del hook</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <Switch checked={activo} onCheckedChange={onToggle} disabled={toggling} />
            </div>
        </div>
    )
}
