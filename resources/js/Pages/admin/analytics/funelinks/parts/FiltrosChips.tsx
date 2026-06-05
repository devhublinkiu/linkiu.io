import { useState } from 'react'
import { X, Plus, Calendar, Package, Globe, Megaphone } from 'lucide-react'
import { Button } from '@/Components/ui/Button'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/Components/ui/Select'
import {
    Popover, PopoverContent, PopoverTrigger,
} from '@/Components/ui/Popover'

export interface ProductoOpt { id: number; nombre: string }
export interface CampanaOpt  { nombre: string; sesiones: number }

export interface FiltrosState {
    producto_id:  number | null
    periodo:      string
    origen:       string | null
    utm_campaign: string | null
}

interface Props {
    filtros:               FiltrosState
    productos:             ProductoOpt[]
    campanasDisponibles:   CampanaOpt[]
    onCambiar:             (cambios: Partial<FiltrosState>) => void
}

const PERIODO_LABEL: Record<string, string> = {
    hoy: 'Hoy',
    '7d': 'Últimos 7 días',
    '30d': 'Últimos 30 días',
}

const ORIGEN_LABEL: Record<string, string> = {
    facebook:  'Facebook',
    instagram: 'Instagram',
    google:    'Google',
    direct:    'Directo',
    otros:     'Otros',
}

/**
 * Barra de filtros activos como chips. Cada chip muestra el valor y permite
 * quitarlo con la X. El botón "+" abre un popover para agregar filtros nuevos.
 * Período siempre presente (no se puede quitar).
 */
export function FiltrosChips({ filtros, productos, campanasDisponibles, onCambiar }: Props) {
    const [popoverAbierto, setPopoverAbierto] = useState(false)

    const productoActivo = filtros.producto_id
        ? productos.find(p => p.id === filtros.producto_id)
        : null

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 flex flex-wrap items-center gap-2">

            {/* Período — siempre visible */}
            <Select value={filtros.periodo} onValueChange={v => onCambiar({ periodo: v })}>
                <SelectTrigger className="h-8 w-auto gap-1.5 text-xs font-medium border-slate-300">
                    <Calendar className="size-3 text-slate-500" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="hoy">Hoy</SelectItem>
                    <SelectItem value="7d">Últimos 7 días</SelectItem>
                    <SelectItem value="30d">Últimos 30 días</SelectItem>
                </SelectContent>
            </Select>

            {/* Chips de filtros opcionales activos */}
            {productoActivo && (
                <ChipFiltro
                    icono={<Package className="size-3" />}
                    label="Producto"
                    valor={productoActivo.nombre}
                    onQuitar={() => onCambiar({ producto_id: null })}
                />
            )}
            {filtros.origen && (
                <ChipFiltro
                    icono={<Globe className="size-3" />}
                    label="Origen"
                    valor={ORIGEN_LABEL[filtros.origen] ?? filtros.origen}
                    onQuitar={() => onCambiar({ origen: null })}
                />
            )}
            {filtros.utm_campaign && (
                <ChipFiltro
                    icono={<Megaphone className="size-3" />}
                    label="Campaña"
                    valor={filtros.utm_campaign}
                    onQuitar={() => onCambiar({ utm_campaign: null })}
                />
            )}

            {/* Botón + agregar filtro */}
            <Popover open={popoverAbierto} onOpenChange={setPopoverAbierto}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs border-dashed border-slate-300 text-slate-600">
                        <Plus className="size-3" />
                        Agregar filtro
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3 space-y-3" align="start">
                    {!filtros.producto_id && (
                        <SeleccionEnPopover
                            label="Producto"
                            placeholder="Todos los productos"
                            opciones={productos.map(p => ({ value: String(p.id), label: p.nombre }))}
                            onElegir={v => { onCambiar({ producto_id: Number(v) }); setPopoverAbierto(false) }}
                        />
                    )}
                    {!filtros.origen && (
                        <SeleccionEnPopover
                            label="Origen"
                            placeholder="Cualquier origen"
                            opciones={[
                                { value: 'facebook',  label: 'Facebook'  },
                                { value: 'instagram', label: 'Instagram' },
                                { value: 'google',    label: 'Google'    },
                                { value: 'direct',    label: 'Directo'   },
                                { value: 'otros',     label: 'Otros'     },
                            ]}
                            onElegir={v => { onCambiar({ origen: v }); setPopoverAbierto(false) }}
                        />
                    )}
                    {!filtros.utm_campaign && campanasDisponibles.length > 0 && (
                        <SeleccionEnPopover
                            label="Campaña UTM"
                            placeholder="Cualquier campaña"
                            opciones={campanasDisponibles.map(c => ({
                                value: c.nombre,
                                label: `${c.nombre} (${c.sesiones})`,
                            }))}
                            onElegir={v => { onCambiar({ utm_campaign: v }); setPopoverAbierto(false) }}
                        />
                    )}
                    {filtros.producto_id && filtros.origen && filtros.utm_campaign && (
                        <p className="text-xs text-slate-500 text-center py-2">
                            Todos los filtros disponibles ya están activos.
                        </p>
                    )}
                </PopoverContent>
            </Popover>

            {/* Período activo como texto sublabel */}
            <p className="text-xs text-slate-400 ml-auto">
                {PERIODO_LABEL[filtros.periodo] ?? 'Últimos 7 días'}
            </p>
        </div>
    )
}

interface ChipProps {
    icono:   React.ReactNode
    label:   string
    valor:   string
    onQuitar: () => void
}

function ChipFiltro({ icono, label, valor, onQuitar }: ChipProps) {
    return (
        <div className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-slate-100 border border-slate-200 text-xs">
            <span className="text-slate-500">{icono}</span>
            <span className="text-slate-500">{label}:</span>
            <span className="font-medium text-slate-900 max-w-[160px] truncate" title={valor}>{valor}</span>
            <button
                onClick={onQuitar}
                className="text-slate-400 hover:text-red-500 transition-colors duration-150 ml-1"
                aria-label={`Quitar filtro ${label}`}
            >
                <X className="size-3" />
            </button>
        </div>
    )
}

interface SeleccionProps {
    label:       string
    placeholder: string
    opciones:    { value: string; label: string }[]
    onElegir:    (v: string) => void
}

function SeleccionEnPopover({ label, placeholder, opciones, onElegir }: SeleccionProps) {
    return (
        <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-700">{label}</p>
            <Select value="" onValueChange={onElegir}>
                <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {opciones.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
