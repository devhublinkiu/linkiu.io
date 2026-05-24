import { Input } from '@/Components/ui/Input'
import { Label } from '@/Components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/Select'
import { cn } from '@/lib/utils'

export const FORM_VACIO = {
    etiqueta: '', departamento: '', ciudad: '', direccion: '', apartamento: '',
}

export type CamposForm = typeof FORM_VACIO

export interface ZonaDepto {
    id: number
    nombre: string
    ciudades: { id: number; nombre: string }[]
}

interface Props {
    form: CamposForm
    setForm: (f: CamposForm) => void
    errores: Record<string, string>
    departamentosDisponibles: ZonaDepto[]
}

export function AddressForm({ form, setForm, errores, departamentosDisponibles }: Props) {
    const ciudadesDisponibles = departamentosDisponibles.find(d => d.nombre === form.departamento)?.ciudades ?? []

    function handleDepartamento(v: string) {
        setForm({ ...form, departamento: v, ciudad: '' })
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="space-y-1">
                <Label>Nombre de la dirección <span className="text-slate-500 font-normal">(opcional)</span></Label>
                <Input
                    value={form.etiqueta}
                    onChange={e => setForm({ ...form, etiqueta: e.target.value })}
                    placeholder="Ej. Mi casa, Oficina…"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label>Departamento</Label>
                    <Select value={form.departamento} onValueChange={handleDepartamento}>
                        <SelectTrigger className={cn('w-full h-9', errores.departamento && 'border-red-300')}>
                            <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                            {departamentosDisponibles.map(d => (
                                <SelectItem key={d.id} value={d.nombre}>{d.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errores.departamento && <p className="text-xs text-red-500">{errores.departamento}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Ciudad</Label>
                    <Select
                        value={form.ciudad}
                        onValueChange={v => setForm({ ...form, ciudad: v })}
                        disabled={!form.departamento}
                    >
                        <SelectTrigger className={cn('w-full h-9', errores.ciudad && 'border-red-300')}>
                            <SelectValue placeholder={form.departamento ? 'Selecciona' : '—'} />
                        </SelectTrigger>
                        <SelectContent>
                            {ciudadesDisponibles.map(c => (
                                <SelectItem key={c.id} value={c.nombre}>{c.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errores.ciudad && <p className="text-xs text-red-500">{errores.ciudad}</p>}
                </div>
            </div>

            <div className="space-y-1">
                <Label>Dirección</Label>
                <Input
                    value={form.direccion}
                    onChange={e => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Calle 100 #15-20"
                    className={errores.direccion ? 'border-red-300' : ''}
                />
                {errores.direccion && <p className="text-xs text-red-500">{errores.direccion}</p>}
            </div>

            <div className="space-y-1">
                <Label>Apto / Casa / Interior <span className="text-slate-500 font-normal">(opcional)</span></Label>
                <Input
                    value={form.apartamento}
                    onChange={e => setForm({ ...form, apartamento: e.target.value })}
                    placeholder="Apto 301"
                />
            </div>
        </div>
    )
}
